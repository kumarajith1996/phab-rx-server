<?php
namespace App\ZoomRx\Utility;

use Cake\Log\Log;

/**
 * Curl Request Wrapper
 */
class CurlRequest
{

    /**
     * Send curl request as json
     * @param  array $requestDetails contains url, body, username, password, useTime
     * @return mixed failure return false, success return response
     */
    public static function sendJsonRequest($requestDetails)
    {
        // Initialize handle and set options
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $requestDetails['url']);
        if (isset($requestDetails['password'])) {
            if (!$requestDetails['username']) {
                $requestDetails['username'] = $this->Auth->user('email');
                $requestDetails['password'] = rtrim(
                    mcrypt_decrypt(
                        MCRYPT_RIJNDAEL_256,
                        md5(ZOOMRX_PWD_CYPHER),
                        base64_decode($_SESSION['zoomrx']['password']),
                        MCRYPT_MODE_CBC,
                        md5(md5(ZOOMRX_PWD_CYPHER))
                    ),
                    "\0"
                );
            }
            curl_setopt(
                $ch,
                CURLOPT_USERPWD,
                $requestDetails['username'] . ':' . $requestDetails['password']
            );
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        }
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $time = 10;
        if (isset($requestDetails['useTime'])) {
            $time = $requestDetails['useTime'];
        }
        curl_setopt($ch, CURLOPT_TIMEOUT, $time);
        if (!empty($requestDetails['body'])) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $requestDetails['body']);
        }

        $headers = [
            'Connection: close',
            'Content-Type:application/json',
            'Accept:application/json'
        ];
        if (!empty($requestDetails['authToken'])) {
            $headers[] = 'Authorization: Bearer ' . $requestDetails['authToken'];
        }
        curl_setopt(
            $ch,
            CURLOPT_HTTPHEADER,
            $headers
        );

        // Execute the request
        $result = curl_exec($ch);

        // Check for errors
        if (curl_errno($ch)) {
            switch (curl_errno($ch)) {
                case 28:
                    if (isset($requestDetails['useTime'])) {
                        $response['time_out'] = true;
                        return $response;
                    }
                    break;
                default:
                    break;
            }
            return false;
        } else {
            $returnCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            switch ($returnCode) {
                case 404:
                    Log::debug('CURL 404 error- ' . $requestDetails['url'], 'curl-request');
                    return false;
                case 401:
                    Log::debug('CURL 401 error- ' . $requestDetails['url'], 'curl-request');
                    return false;
                default:
                    break;
            }
        }
        // Close the handle
        curl_close($ch);
        return json_decode($result, true);
    }

    /**
     * This function will send multiple http requests parallely.
     * It will be as slow as the slowest request, as opposed to the sum of all requests
     * @param  array  $urlList array of urls
     * @param  array  $options Extra option for the requests
     * @return array           Returns the array of responses as strings
     */
    public static function sendMultipleRequest($urlList, $options = array())
    {
        // array of curl handles
        $curly = array();
        // data to be returned
        $result = array();

        // multi handle
        $mh = curl_multi_init();

        // loop through $urlList and create curl handles
        // then add them to the multi-handle
        foreach ($urlList as $id => $d) {
            $curly[$id] = curl_init();
            
            $url = (is_array($d) && !empty($d['url'])) ? $d['url'] : $d;
            curl_setopt($curly[$id], CURLOPT_URL, $url);
            curl_setopt($curly[$id], CURLOPT_HEADER, 0);
            curl_setopt($curly[$id], CURLOPT_RETURNTRANSFER, 1);

            // post?
            if (is_array($d)) {
                if (!empty($d['post'])) {
                    curl_setopt($curly[$id], CURLOPT_POST, 1);
                    curl_setopt($curly[$id], CURLOPT_POSTFIELDS, $d['post']);
                }
            }
            // extra options?
            if (!empty($options)) {
                curl_setopt_array($curly[$id], $options);
            }
            curl_multi_add_handle($mh, $curly[$id]);
        }

        // execute the handles
        $running = null;
        $state = count($urlList);
        do {
            curl_multi_exec($mh, $running);
            if ($state != $running) {
                $state = $running;
                foreach ($curly as $id => $c) {
                    $result[$id] = curl_multi_getcontent($c);
                }
            }
        } while ($running > 0);

        // get content and remove handles
        foreach ($curly as $id => $c) {
            $result[$id] = curl_multi_getcontent($c);
            curl_multi_remove_handle($mh, $c);
        }

        // all done
        curl_multi_close($mh);
        return $result;
    }
}
