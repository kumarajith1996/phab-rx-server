<?php
namespace App\Model\Table;

use Cake\ORM\Table;
use App\Zoomrx\Utility\ConduitHelper;

class UsersTable extends Table
{
	/**
     * Function to get users based on the team_name
     *
     * @return \Cake\Http\Response|null
     */
	public function returnListofUsers($apiParameters){
		try {
			$userDetails = ConduitHelper::callMethodSynchronous('user.search', $apiParameters);
		} catch (\Exception $e) {
			$errorMessages[] = $e->getMessage();
			return $errorMessages;
		}
		$responseData = [];
		foreach($userDetails['data'] as $userDetails) {
            $responseData[] = [
            	'name' => $userDetails['fields']['realName'],
            	'email' => $userDetails['fields']['username'] . '@zoomrx.com'
            ];
        }

        return $responseData;
	}
}