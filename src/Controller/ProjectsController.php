<?php
namespace App\Controller;

use App\Controller\AppController;
use App\Zoomrx\Utility\ConduitHelper;
use Cake\Log\Log;

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
        $projectData = ConduitHelper::callMethodSynchronous('project.search', ['order' => 'newest']);
        $projects = [];
        foreach ($projectData['data'] as $project) {
            $projects[] = [
                'id' => $project['id'],
                'phid' => $project['phid'],
                'name' => $project['fields']['name'],
                'parent_name' => $project['fields']['parent']['name']
            ];
        }
        $this->set(compact('projects'));
    }
}
