<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Log\Log;
use App\Zoomrx\Utility\CurlRequest;
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
        $api_token = "<api-token>";
        $api_parameters = array();

        $client = new ConduitClient('https://phab.zoomrx.com/');
        $client->setConduitToken($api_token);

        $result = $client->callMethodSynchronous('maniphest.priority.search', $api_parameters);
        print_r($result);

        $this->set(compact('result'));
    }
}
