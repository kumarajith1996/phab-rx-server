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
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {
        $result = ConduitHelper::callMethodSynchronous('maniphest.search', ['attachments' => ['projects' => true], "limit"=> 10]);
        $selectedOwners = [];
        $selectedProjects = [];
        foreach ($result['data'] as $project) {
            $selectedOwners[] = $project['fields']['ownerPHID'] ?? '';
            $selectedProjects = array_merge($selectedProjects, $project['attachments']['projects']['projectPHIDs']);
        }
        // $selectedProjects = array_unique($selectedProjects);
        $projects = ConduitHelper::callMethodSynchronous('project.search', ['constraints' => ['phids' => $selectedProjects]]);
        $owners = ConduitHelper::callMethodSynchronous('user.search', ['constraints' => ['phids' => $selectedOwners]]);
        $ownerMap = [];
        $projectMap = [];
        foreach ($owners['data'] as $owner) {
            $ownerMap[$owner['phid']] = $owner['fields']['username'];
        }
        foreach ($projects['data'] as $project) {
            $projectMap[$project['phid']] = $project['fields']['name'];
        }
        $returnData = [];
        Log::debug($result);
        Log::debug($ownerMap);
        Log::debug($projectMap);
        foreach ($result['data'] as $project) {
            $currentData = [
                'id' => $project['id'],
                'phid' => $project['phid'],
                'name' => $project['fields']['name'],
                'description' => $project['fields']['description']['raw'],
                'owner' => $ownerMap[$project['fields']['ownerPHID']] ?? '',
                'ownerPHID' => $project['fields']['ownerPHID'],
                'status' => $project['fields']['status']['name'],
                'priority' => $project['fields']['priority']['name']
            ];
            foreach ($project['attachments']['projects']['projectPHIDs'] as $phid) {
                $currentData['projects'][] = ['phid' => $phid, 'name' => $projectMap[$phid]];
            }
            $returnData[] = $currentData;
        }

        $this->set(compact('returnData'));
    }
}
