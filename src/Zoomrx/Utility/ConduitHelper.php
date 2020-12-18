<?php
namespace App\Zoomrx\Utility;

use Cake\Log\Log;

require_once '../vendor/arcanist-master/src/__phutil_library_init__.php';
/**
 * Conduit helper Wrapper
 */
class ConduitHelper
{
    const TOKEN = "cli-r5c7qz2ecd7bxcdzikaxfx5nsosb";
    const URL = 'https://phab.zoomrx.com/';

    public static function callMethodSynchronous($requestUrl, $params)
    {
        $client = new \ConduitClient(self::URL);
        $client->setConduitToken(self::TOKEN);

        return $client->callMethodSynchronous($requestUrl, $params);
    }
}
