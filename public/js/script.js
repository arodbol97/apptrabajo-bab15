let map;
let myWayBack = null;
let markers = [];
let userPoint;
let polyline = "";
let routes = [];
let pointCoords;
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
          ],
          disableDefaultUI: true
    };
    
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    currentLocation(findMe);

    // Fetch data from firestore
    fetchData();

    google.maps.event.addListener(map, 'click', function(event) {
        if(myWayBack != null){
            removeWayBack();
        }
    });
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
        
        //Click on map point
        google.maps.event.addListener(newMarker, 'click', function(event) {
        
            const clickedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };            
            
            const circleId = newMarker.get('id');
    
            selectPoint(circleId);
        });

        google.maps.event.addListener(newMarker, 'mouseover', function() {        
            let tableRow = document.getElementById("point" + newMarker.get("id"));
            newMarker.setOptions({ fillColor: 'blue', strokeColor: 'blue'});
            tableRow.classList.add("selectedRow");
        });
        
          
        google.maps.event.addListener(newMarker, 'mouseout', function() {            
            let tableRow = document.getElementById("point" + newMarker.get("id"));
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
    pointCoords = []; 

    (async () => {
        try {
        const data = await fetchRouteJSON(route);        
        data.forEach(point => {
            pointCoords.push({lat:point["latitude"],lng:point["longitude"]})
        });       
    
        polyline = new google.maps.Polyline({
            path: pointCoords,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: map
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
    document.getElementById("map").style.display = "block";
    document.getElementById("info").style.display = "none";
    selectedRoute = routes.find(obj => obj.id === routeId);
    infoDiv = document.getElementById("info");
    addMarkers(routeId);

    infoDiv.innerHTML = "";

    pointsTable = "";

    pointsTable += `
    <table id="pointsTable">
        <thead>
            <th>
                ${selectedRoute.nombre}
            </th>
        </thead>
        <tbody>`;

        selectedRoute.points.forEach(point => {
            pointsTable += `
            <tr id="point${point["Id"]}" class="pointRow">
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

    selectedRoute.points.forEach(point => {
        let pointRow = document.getElementById("point" + point["Id"]);
        let pointCircle;

        markers.forEach(marker => {
            if(marker.get("id") == point["Id"]){
                pointCircle = marker;
            }
        });

        pointRow.addEventListener("click",()=>{
            selectPoint(point["Id"]);
        });

        pointRow.addEventListener("mouseover",()=>{
            pointCircle.setOptions({ fillColor: 'blue', strokeColor: 'blue'});
            pointRow.classList.add("selectedRow");
        });

        pointRow.addEventListener("mouseout",()=>{
            pointCircle.setOptions({ fillColor: '#FF0000', strokeColor: '#FF0000'});
            pointRow.classList.remove("selectedRow");
        });
    });
}

function selectPoint(pointId){
    if(document.getElementById("pointTable") != null){
        document.getElementById("pointTable").remove();
    }
    selectedPoint = selectedRoute.points.find(obj => obj.Id === pointId);
    let tableRow = document.getElementById(pointId);
    let circle = markers.find(obj => obj.id === pointId);

    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");

    table.setAttribute("id","pointTable");

    let nametr = document.createElement("tr");
    let nameth = document.createElement("th");
    nameth.innerHTML = selectedPoint["Nombre"];
    nametr.appendChild(nameth);
    thead.appendChild(nametr);    

    if(selectedPoint["Nombre"] == "Centro de salud"){
        let audiotr = document.createElement("tr");
        let audiotd = document.createElement("td");
        let audioPlayer = document.createElement("audio");        
        audioPlayer.setAttribute("controls","true");
        audioPlayer.innerHTML = `
        <source src="${selectedPoint["AudioURL"]}" type="audio/mp3">
        Navegador no es compatible
        `;
        audiotd.appendChild(audioPlayer);
        audiotr.appendChild(audiotd);
        tbody.appendChild(audiotr);
    }

    let coordXtr = document.createElement("tr");
    let coordXtd = document.createElement("td");    
    coordXtd.innerHTML = "Latitud: "+selectedPoint["CoordX"];    
    coordXtr.appendChild(coordXtd);
    tbody.appendChild(coordXtr);

    let coordYtr = document.createElement("tr");
    let coordYtd = document.createElement("td");    
    coordYtd.innerHTML = "Longitud "+selectedPoint["CoordY"];    
    coordYtr.appendChild(coordYtd);
    tbody.appendChild(coordYtr);

    let radiotr = document.createElement("tr");
    let radiotd = document.createElement("td");
    radiotd.innerHTML = "Radio: "+selectedPoint["Radio"];    
    radiotr.appendChild(radiotd);
    tbody.appendChild(radiotr);

    table.appendChild(thead);
    table.appendChild(tbody);
    document.getElementById("info").appendChild(table);
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

function currentLocation(callback){
    if ("geolocation" in navigator) {
        // Get the current position
        navigator.geolocation.getCurrentPosition(function(position) {
            // Access the latitude and longitude from the position object
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;            
    
            // Create a LatLng object with the coordinates
            latLng = {lat: latitude, lng: longitude};
            callback(latLng);
        }, function(error) {
          console.log('Error getting user location:', error.message);
        });
    } else {
        console.log('Geolocalizción desactivada o incompatible.');
    }
}

function findMe(latLng){

    let deviceIcon = {
        url: '../deviceIcon.png',
        scaledSize: new google.maps.Size(20, 20) // Adjust the size as needed
    };

    userPoint = new google.maps.Marker({        
        map: map,
        position: latLng,        
        icon: deviceIcon
    });

    navigator.geolocation.watchPosition(function (position) {
        var userLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // Update the circle's position
        userPoint.setPosition(userLatLng);
    });

}