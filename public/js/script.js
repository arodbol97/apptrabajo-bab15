let map;
let markers = [];
let polyline = "";
let routes = [];
let selectedRoute = "";
let selectedPoint = "";



/**
 * Initiates the map. Will run automatically on load. 
 */
function initMap() {
    // Initial map options
    var mapOptions = {
        center: { lat: 37.8882, lng: -4.7794 },
        zoom: 12,
        styles: [            
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [
                { "color": "#C0C0C0" }
              ]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.text.fill",
              "stylers": [
                { "color": "#C0C0C0" }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                { "color": "#C0C0C0" }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [
                { "color": "#808080" }
              ]
            },
          ]
    };
    
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Fetch data from firestore
    fetchData();
}

/**
 * Adds the markers to the map and the array.
 *
 * @param {int} routeId - Id of the route to show.
 */
function addMarkers(routeId) {
    let route = routes.find(obj => obj.id === routeId);   
    
    route.points.forEach(point => {
        let newMarker = new google.maps.Circle({
            center: {lat:point["CoordX"],lng:point["CoordY"]},
            radius: point["Radio"],
            id: point["Id"],
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map
        });

        

        google.maps.event.addListener(newMarker, 'click', function(event) {
        
            const clickedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };            
            
            const circleId = newMarker.get('id');
    
            selectPoint(circleId);
        });

        google.maps.event.addListener(newMarker, 'mouseover', function() {        
            let tableRow = document.getElementById(newMarker.get("id"));
            newMarker.setOptions({ fillColor: 'blue', strokeColor: 'blue'});
            tableRow.classList.add("selectedRow");
        });
        
          
        google.maps.event.addListener(newMarker, 'mouseout', function() {            
            let tableRow = document.getElementById(newMarker.get("id"));
            newMarker.setOptions({ fillColor: '#FF0000', strokeColor: '#FF0000'});
            tableRow.classList.remove("selectedRow");
        });

        markers.push(newMarker);
    });

    locateRoute(route);
    
    
    
}

/**
 * Updates route data.
 */
function updateRoute() {
    fetchData();
}

/**
 * Centers the map on a route
 *
 * @param {object} route - Route object. 
 */
function locateRoute(route) {
    let pointCoords = []; 

    (async () => {
        try {
        const data = await fetchRouteJSON(route);        
        data.forEach(point => {
            pointCoords.push({lat:point["latitude"],lng:point["longitude"]})
        });       
    
        /*polyline = new google.maps.Polyline({
            path: pointCoords,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: map
        });*/

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

        const waypoints = pointCoords.slice(1, -1).map(point => ({ location: new google.maps.LatLng(point.lat, point.lng) }));

        const request = {
            origin: new google.maps.LatLng(pointCoords[0].lat, pointCoords[0].lng),
            destination: new google.maps.LatLng(pointCoords[pointCoords.length - 1].lat, pointCoords[pointCoords.length - 1].lng),
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.WALKING,
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
            directionsRenderer.setDirections(result);
            } else {
            console.error(`Directions request failed with status: ${status}`);
            }
        });

        let bounds = new google.maps.LatLngBounds();
        pointCoords.forEach(point => bounds.extend(point));
        map.fitBounds(bounds);
        } catch (error) {console.error('Error:', error)}
    })();    
}

/**
 * Fetches data from firestore database.
 */
function fetchData(){
    fetch('../firestoreFetchData.php')
        .then(response => response.json())
        .then(data => {
            handleData(data);
        })
        .catch(error => console.error('Error:', error));
}

async function fetchRouteJSON(route) {
    try {
        
      const response = await fetch('../firestoreFetchJSON.php?url=' + encodeURIComponent(route.rutaURL));
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      
      return data;
      // Process the data or do further actions here
  
    } catch (error) {
      console.error('Error:', error);
    }
  }

/**
 * Handles the data from the database
 * 
 * @param {Array} data - array withe the whole database.
 */
function handleData(data){

    let points = data["monuments"];

    data["routes"].forEach(route => {
        if(route["Id"] == 1){                   //Borrar cuando se borren las rutas de prueba
            let newRoute = {
                "audio" : route["Audio"],
                "audioURL" : route["AudioURL"],
                "id" : route["Id"],
                "localizacion" : route["Localizacion"],
                "nombre" : route["Nombre"],
                "rutaURL" : route["RutaURL"],
                "points" : []
            }
    
            points.forEach(point => {
                if(point["IdRuta"] == route["Id"]){
                    newRoute.points.push(point);
                }
            });
    
            routes.push(newRoute);
        }
    });

    routes.forEach(route => {
        let button = document.createElement('button');
        button.textContent = `Mostrar ruta: ${route.nombre}`;
        button.addEventListener('click', () => selectRoute(route.id));
        document.getElementById("info").appendChild(button);
    });
}

function selectRoute(routeId){
    selectedRoute = routes.find(obj => obj.id === routeId);
    infoDiv = document.getElementById("info");
    addMarkers(routeId);

    infoDiv.innerHTML = "";

    pointsTable = "";

    pointsTable += `
    <table>
        <thead>
            <th>
                ${selectedRoute.nombre}
            </th>
        </thead>
        <tbody>`;

        selectedRoute.points.forEach(point => {
            pointsTable += `
            <tr id="${point["Id"]}" class="pointRow" onclick="selectPoint(${point["Id"]})">
                <td>
                    ${point["Nombre"]}
                </td>
            </tr>`;
        });

        pointsTable += `
        </tbody>
    </table>
    `;

    infoDiv.innerHTML = pointsTable;    

    
}

function selectPoint(pointId){
    selectedPoint = selectedRoute.points.find(obj => obj.Id === pointId);
    let tableRow = document.getElementById(pointId);
    let circle = markers.find(obj => obj.id === pointId);

    console.log(tableRow);
    console.log(circle);

}

/**
 * Deletes every marker on the map.
 */
function cleanMarkers() {
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];
}