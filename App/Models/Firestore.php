<?php

namespace App\Models;

use Google\Cloud\Firestore\FirestoreClient;
use Google\Cloud\Firestore\CollectionReference;
use Google\Cloud\Firestore\DocumentReference;

class Firestore {

    private FirestoreClient $firestore;

    public function __construct(){
        $this->firestore = new FirestoreClient([
            "keyFilePath" => __DIR__ . DIRECTORY_SEPARATOR ."/../config/apptrabajo-bab15-firebase-adminsdk-awlep-62a1067c5b.json",
            "projectId" => "apptrabajo-bab15",
        ]);
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