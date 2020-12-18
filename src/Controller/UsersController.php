<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Log\Log;
use App\Zoomrx\Utility\ConduitHelper;
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
}
