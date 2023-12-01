let map;
let markers = [];
let points = [];
let routes = [];

function initMap() {
    // Specify the initial map options
    var mapOptions = {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        zoom: 12,
    };
    
    // Create the map
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    fetchData();    
}

function addMarker(x,y,title) {
    var marker = new google.maps.Marker({
        position: {lat: x, lng: y},
        map: map,
        title: 'title'
    });
    markers.push(marker);
}

function cleanMarkers() {
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];
}

function updateRoute() {

}

function locateRoute() {
    let bigX, bigY, smallX, smallY;
    array.forEach(element => {
        
    });
    array.forEach(element => {
        
    });
}

function fetchData(){
    fetch('../firestoreFetchData.php')
        .then(response => response.json())
        .then(data => {
            handleData(data);
        })
        .catch(error => console.error('Error:', error));
}

function handleData(data){    
    points = data["monuments"];
    routes = data["routes"];    
}