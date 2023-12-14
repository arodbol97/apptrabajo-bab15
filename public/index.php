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
    <link rel="stylesheet" href="css/style.css">
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDB6gjDsE59yK8vQS22FFrfabHSb6qOGHU&callback=initMap" 
    async defer></script>
</head>
<body>    
    <?php
        include '..' . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'header.php';
    ?>
    <div id="map"></div>
    <div id="info"></div>
    <script src="js/script.js" defer></script>
</body>
</html>
