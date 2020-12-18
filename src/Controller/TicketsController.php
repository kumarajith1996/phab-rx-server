<?php
namespace App\Controller;

use App\Controller\AppController;
use App\Zoomrx\Utility\ConduitHelper;
use Cake\Log\Log;

/**
 * Tickets Controller
 *
 *
 * @method \App\Model\Entity\Ticket[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class TicketsController extends AppController
{
    const STATUS_MAP = [
        'open' => 0,
        'assess' => 1,
        'inProgress' => 2,
        'codeReview' => 3,
        'unitTesting' => 4,
        'fixed' => 5,
        'readyForQATesting' => 6,
        'qaTesting' => 7,
        'qaCompleted' => 8,
        'userAcceptanceTesting' => 9,
        'readyToRelease' => 10,
        'resolved' => 11,
        'notReproducible' => 12,
        'willFixLater' => 13,
        'wontfix' => 14,
        'invalid' => 15,
        'Assess' => 1,
        'Open' => 0
    ];

    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {
        $queryParams = $this->request->query();
        $constraints = [];
        if (!empty($queryParams['name'])) {
            $constraints['query'] = $queryParams['name'];
        } elseif (!empty($queryParams['description'])) {
            $constraints['query'] = $queryParams['description'];
        }
        if (!empty($queryParams['status'])) {
            $constraints['statuses'] = [$queryParams['status']];
        }
        if (!empty($queryParams['priority'])) {
            $constraints['priorities'] = [intval($queryParams['priority'])];
        }
        if (!empty($queryParams['project'])) {
            $filterProjects = ConduitHelper::callMethodSynchronous('project.search', ['constraints' => ['ids' => [intval($queryParams['project'])]]]);
            $constraints['projects'] = [$filterProjects['data'][0]['phid']];
        }
        if (!empty($queryParams['user'])) {
            $constraints['assigned'] = [$queryParams['user']];
        }
        $result = ConduitHelper::callMethodSynchronous('maniphest.search', ['attachments' => ['projects' => true], 'constraints' => $constraints]);
        $selectedOwners = [];
        $selectedProjects = [];
        foreach ($result['data'] as $project) {
            $selectedOwners[] = $project['fields']['ownerPHID'] ?? '';
            $selectedProjects = array_merge($selectedProjects, $project['attachments']['projects']['projectPHIDs']);
        }
        $selectedProjects = array_values(array_unique($selectedProjects));
        $projectMap = [];
        $ownerMap = [];
        if ($selectedProjects) {
            $projects = ConduitHelper::callMethodSynchronous('project.search', ['constraints' => ['phids' => $selectedProjects]]);
            foreach ($projects['data'] as $project) {
                $projectMap[$project['phid']] = $project['fields']['name'];
            }
        }
        if ($selectedOwners) {
            $owners = ConduitHelper::callMethodSynchronous('user.search', ['constraints' => ['phids' => $selectedOwners]]);
            foreach ($owners['data'] as $owner) {
                $ownerMap[$owner['phid']] = $owner['fields']['username'];
            }
        }
        
        $returnData = [];
        foreach ($result['data'] as $project) {
            $currentData = [
                'id' => $project['id'],
                'phid' => $project['phid'],
                'name' => $project['fields']['name'],
                'description' => $project['fields']['description']['raw'],
                'owner' => $ownerMap[$project['fields']['ownerPHID']] ?? '',
                'ownerPHID' => $project['fields']['ownerPHID'],
                'status' => ['value' => $project['fields']['status']['name'], 'name' => $project['fields']['status']['value'], 'id' => self::STATUS_MAP[$project['fields']['status']['value']]],
                'priority' => $project['fields']['priority']['name']
            ];
            foreach ($project['attachments']['projects']['projectPHIDs'] as $phid) {
                $currentData['projects'][] = ['phid' => $phid, 'name' => $projectMap[$phid] ?? 'Restrict Project'];
            }
            $returnData[] = $currentData;
        }

        $this->set(compact('returnData'));
    }

    private function _identifyOwner($ticketPHID, $newStatus) 
    {
        $ticketDetails = ConduitHelper::callMethodSynchronous('maniphest.search', ['constraints' => ['phids' => [$ticketPHID]], "limit"=> 1]);
        $ticketDetails = $ticketDetails['data'][0];
        $oldStatus = $ticketDetails['fields']['status']['value'];
        $transactionDetails = ConduitHelper::callMethodSynchronous('transaction.search', ['objectIdentifier' => $ticketPHID]);
        $tracingStatus = $oldStatus;
        $tracingOwner = $ticketDetails['fields']['ownerPHID'];
        $expectedState = '';
        if ($oldStatus == 'codeReview') {
            $expectedState = 'unitTesting';
        } elseif ($oldStatus == 'qaTesting') {
            $expectedState = 'fixed';
        } elseif ($oldStatus == 'userAcceptanceTesting' && $newStatus == 'readyToRelease') {
            $expectedState = 'qaCompleted';
        } elseif ($oldStatus == 'userAcceptanceTesting' && $newStatus == 'qaTesting') {
            $expectedState = 'qaTesting';
        }

        $ownerChanged = false;
        $expectedStateReached = false;
        foreach ($transactionDetails['data'] as $transaction) {
            if (!in_array($transaction['type'], ["owner", "status"])) {
                continue;
            }
            if ($transaction['type'] == "status") {
                if ($transaction['fields']['old'] == $expectedState) {
                    $expectedStateReached = true;
                    if ($ownerChanged) {
                        break;
                    }
                } elseif ($expectedStateReached) {
                    break;
                }
            }
            if ($transaction['type'] == "owner") {
                if ($transaction['fields']['old'] != $ticketDetails['fields']['ownerPHID']) {
                    $ownerChanged = true;
                    $tracingOwner = $transaction['fields']['old'];
                    if ($expectedStateReached) {
                        break;
                    }
                }
            }
        }
        return $tracingOwner != $ticketDetails['fields']['ownerPHID'] ? $tracingOwner : '';
    }

    /**
     * Edit Ticket method
     *
     * @return \Cake\Http\Response|null
     */
    public function editTickets()
    {
        $returnResults = ['objects' => [], 'transactions' => []];
        $errorMessages = [];

        $queryParams = $this->request->data;
        $tickets = is_array($queryParams['tickets']) ? $queryParams['tickets']:[$queryParams['tickets']];
        $transactions = [];
        if (!empty($queryParams['status'])) {
            $transactions[] = ['type' => 'status', 'value' => $queryParams['status']];
        }
        if (!empty($queryParams['owner'])) {
            $transactions[] = ['type' => 'owner', 'value' => $queryParams['owner']];
        }
        if (!empty($queryParams['add_projects'])) {
            $add_projects = is_array($queryParams['add_projects']) ? $queryParams['add_projects']:[$queryParams['add_projects']];
            $transactions[] = ['type' => 'projects.add', 'value' => $add_projects];
        }
        if (!empty($queryParams['remove_projects'])) {
            $remove_projects = is_array($queryParams['remove_projects']) ? $queryParams['remove_projects']:[$queryParams['remove_projects']];
            $transactions[] = ['type' => 'projects.remove', 'value' => $remove_projects];
        }

        $apiParams = [
            "transactions" => $transactions,
            'objectIdentifier' => "",
        ];
        foreach ($tickets as $ticket) {
            $apiParams['objectIdentifier'] = $ticket;
            try {
                $currentResult = ConduitHelper::callMethodSynchronous(
                    'maniphest.edit',
                    $apiParams
                );
                $returnResults['objects'][] = $currentResult['object'];
                $returnResults['transactions'][] = $currentResult['transactions'];
            } catch (\Exception $e) {
                $errorMessages[] = $e->getMessage();
            }
        }
        $returnValue = $errorMessages ?: $returnResults;
        $this->set(compact('returnValue'));
    }
}
