<?php
// An array of HTTP methods that
// we want to allow.
$allowedMethods = array(
    'POST',
    'GET'
);
$allowedActions = array(
    'getUltimateBraveryChampions',
    'getUltimateBraveryDataForChampion'
);

// The current request type.
$requestMethod = strtoupper($_SERVER['REQUEST_METHOD']);

// If the request method isn't in our
// list of allowed methods.
if(!in_array($requestMethod, $allowedMethods)){
    // Send a 405 Method Not Allowed header.
    header('Content-Type: application/json');
    header($_SERVER["SERVER_PROTOCOL"]." 405 Method Not Allowed", true, 405);
    $msg = [ "error" => true, "message" => "Method no allowed" ];
    echo json_encode($msg);
    // Halt the script's execution.
    exit;
}

$data = file_get_contents('php://input');
$decoded = json_decode($data);

if (json_last_error() != JSON_ERROR_NONE) {
    header('Content-Type: application/json');
    header($_SERVER["SERVER_PROTOCOL"]." 400 Bad Request", true, 400);
    $msg = [ "error" => true, "message" => "Malformed input" ];
    echo json_encode($msg);
    exit;
}

if (!in_array($decoded->method, $allowedActions)) {
    header('Content-Type: application/json');
    header($_SERVER["SERVER_PROTOCOL"]." 400 Bad Request", true, 400);
    $msg = [ "error" => true, "message" => "Action " . $decoded->method . " not allowed" ];
    echo json_encode($msg);
    exit;
}

$handle = curl_init();
if ($decoded->method == 'getUltimateBraveryChampions') {
    $url = "https://api2.ultimate-bravery.net/bo/api/ultimate-bravery/v1/static-data/classic";

    curl_setopt_array($handle,
      array(
        CURLOPT_URL => $url,
         // Enable the get response.
        CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
        // The data to transfer with the response.
        CURLOPT_RETURNTRANSFER => true,
      )
    );
} else {
    $url = "https://api2.ultimate-bravery.net/bo/api/ultimate-bravery/v1/classic/dataset";

    curl_setopt_array($handle,
      array(
        CURLOPT_URL => $url,
         // Enable the post response.
        CURLOPT_POST => true,
        // The data to transfer with the response.
        CURLOPT_POSTFIELDS => json_encode($decoded->payload),
        CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
        CURLOPT_RETURNTRANSFER => true,
      )
    );
}

$data = curl_exec($handle);
curl_close($handle);
header('Content-Type: application/json');
$msg = [ "error" => false, "response" => $data ];
echo json_encode($msg);

