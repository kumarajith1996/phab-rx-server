<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Log\Log;
use App\Zoomrx\Utility\CurlRequest;

/**
 * Projects Controller
 *
 *
 * @method \App\Model\Entity\Project[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class ProjectsController extends AppController
{
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {
        $result = CurlRequest::sendJsonRequest([
            'url' => 'https://phab.zoomrx.com/api/maniphest.search?api.token=cli-r5c7qz2ecd7bxcdzikaxfx5nsosb',
            'useTime' => 10
        ]);

        $returnData = [];
        foreach ($result['result']['data'] as $project) {
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
