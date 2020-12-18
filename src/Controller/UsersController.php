<?php
namespace App\Controller;

use App\Controller\AppController;
use App\Zoomrx\Utility\ConduitHelper;
use Cake\Log\Log;
use Cake\ORM\TableRegistry;
/**
 * Users Controller
 *
 *
 * @method \App\Model\Entity\User[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */

class UsersController extends AppController
{
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    { 
        $result = ConduitHelper::callMethodSynchronous('user.search', []);
        $this->set(compact('result'));
    }

    /**
     * Fetch users based on their teams
     *
     * @return \Cake\Http\Response|null
     */
    public function getUsers()
    {
        $this->request->allowMethod(['get']);
        $teamNames = [
            'Users_Dev_Client_Team' => 14,
            'Users_Dev_Server_Team' => 15,
            'Users_DevSecOps_Team' => 13,
            'Users_QA_Automation_Team' => 17,
            'Users_QA_Manual_Team' => 16,
            'Users_QA_Team' => 12,
            'Users_Tech_Manager_Team' => 61,
            'Users_Tech_Team' => 5,
            'Users_Dev_Team' => 11,
            'Users_BA_Team' => 110,
            'Users_Community_Team' => 7,
            'Users_Design_Team' => 8,
            'Users_Special_Groups' => 108,
            'Users_Dev_Patch_Team' => 581,
            'Users_Comm_Minor_Patch_Release_Team' => 321,
            'Users_BA_Tableau_Team' => 284,
            'Users_BA_Synapse_Team' => 283,
            'Users_BA_SurveyInterface_Team' => 317,
            'Users_BA_Ops_Team' => 286,
            'Users_BA_OncLite_Team' => 315,
            'Users_BA_Minor_Patch_Release_Team' => 115,
            'Users_BA_Hashtag_Team' => 282,
            'Users_BA_DDIM_Team' => 316,
            'Users_BA_Darwin_Team' => 285,
            'Users' => 4,
        ];
        $apiParameter = [];
        if (!empty($this->request->query)) {
            $requestData = $this->request->query;
            $requestData = (json_decode($requestData['team_name'], true));
            foreach ($requestData as $teamName) {
                $apiParameter['constraints']['ids'][] = $teamNames[$teamName];
            }
            $apiParameter['attachments']['members'] = true;
        }

        $result = ConduitHelper::callMethodSynchronous('project.search', $apiParameter);
        foreach ($result['data'] as $membersData) {
            foreach ($membersData['attachments']['members']['members'] as $memberData) {
                $memberPhids[] = $memberData['phid'];
            }
        }
        $apiParameters = [];
        $apiParameters['constraints']['phids'] = $memberPhids;
        $responseData = TableRegistry::get('Users')->returnListofUsers($apiParameters);
        $this->set(compact('responseData'));
    }

    /**
     * Method to search users based on the substring
     *
     * @return \Cake\Http\Response|null
     */
    public function searchUsers()
    {
        $this->request->allowMethod(['get']);
        $api_parameter = [];
        if (!empty($this->request->query)) {
            $requestData = $this->request->query;
            $requestData = (json_decode($requestData['user_name'], true));
        }
        $apiParameters['constraints']['nameLike'] = $requestData;
        $responseData = TableRegistry::get('Users')->returnListofUsers($apiParameters);
        $this->set(compact('responseData'));
    }
}
