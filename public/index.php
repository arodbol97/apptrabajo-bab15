<?php

require_once __DIR__ . "/../vendor/autoload.php";

use App\Models\Firestore;

$db = new Firestore();

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa</title>    
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDB6gjDsE59yK8vQS22FFrfabHSb6qOGHU&callback=initMap" 
    async defer></script>    
</head>
<body>    
    <div id="map" style="height: 300px"></div>
    
    <script src="js/script.js"></script>
</body>
</html>
