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
        $owners = ConduitHelper::callMethodSynchronous('user.search', ['attachments' => ['projects' => true], "limit"=> 10]);
        $projects = ConduitHelper::callMethodSynchronous('maniphest.search', ['attachments' => ['projects' => true], "limit"=> 10]);
        $selectedOwners = [];
        $selectedProjects = [];
        foreach ($result['data'] as $project) {
            $users = [];
        }
        $returnData = [];
        foreach ($result['data'] as $project) {
            $returnData[] = [
                'id' => $project['id'],
                'phid' => $project['phid'],
                'name' => $project['fields']['name'],
                'description' => $project['fields']['description']['raw'],
                'ownerPHID' => $project['fields']['ownerPHID'],
                'status' => $project['fields']['status']['name'],
                'priority' => $project['fields']['priority']['name']
            ];
        }

        $this->set(compact('returnData'));
    }
}
