<?php
require 'vendor/autoload.php';

use Google\Cloud\Firestore\FirestoreClient;
use App\Models\Firestore;

$db = new Firestore();

echo $db->dumpDataToJson();