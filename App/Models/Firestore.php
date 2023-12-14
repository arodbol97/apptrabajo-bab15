<?php

namespace App\Models;

use Google\Cloud\Firestore\FirestoreClient;
use Google\Cloud\Firestore\CollectionReference;
use Google\Cloud\Firestore\DocumentReference;

class Firestore {

    private FirestoreClient $firestore;

    public function __construct(){
        try {
            $this->firestore = new FirestoreClient([
                "keyFilePath" => __DIR__ . "/../config/apptrabajo-bab15-firebase-adminsdk-awlep-62a1067c5b.json",
                "projectId" => "apptrabajo-bab15",
            ]);
        } catch (\Exception $e) {
            die('Firestore initialization error: ' . $e->getMessage() . ' ' . $e->getCode() . ' ' . $e->getTraceAsString());
        }
    }

    public function dumpDataToJson(){
        $monuments = $this->firestore->collection('Monumentos')->documents();
        $routes = $this->firestore->collection('Rutas')->documents();        

        $data = [];

        foreach ($monuments as $monument) {
            $data["monuments"] [] = $monument->data();
        }
        foreach ($routes as $route) {
            $data["routes"] [] = $route->data();
        }

        return json_encode($data);
    }
}