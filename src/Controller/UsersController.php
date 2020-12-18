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
        $result = CurlRequest::sendJsonRequest([
            'url' => 'https://phab.zoomrx.com/api/user.search?api.token=cli-r5c7qz2ecd7bxcdzikaxfx5nsosb',
            'useTime' => 10
        ]);

        $this->set(compact('result'));
    }
}
