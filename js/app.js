// ViewModel section

// Defining JSON list of locations (could have been placed also in a 'Model')
var map, infoWindow;

var myMap = {
    search: ko.observable(""),
    locations: ko.observableArray([ //opening observableArray
        {
            name: "Basilica dei Frari",
            city: "Venice",
            street: "San Polo, 3072",
            lat: 45.4369864,
            lng: 12.3266004,
            marker: null,
            wiki: "Santa Maria Gloriosa dei Frari", // necessary for Wikipedia API call
            display: ko.observable(1) //set ko.observable to being visibile
        }, {
            name: "Ponte di Rialto",
            city: "Venice",
            street: "San Marco, 5335",
            lat: 45.4379842,
            lng: 12.335898,
            marker: null,
            wiki: "Rialto Bridge", // necessary for Wikipedia API call
            display: ko.observable(1) //set ko.observable to being visibile
        }, {
            name: "Train Station",
            city: "Venice",
            street: "Santa Lucia, 1",
            lat: 45.4410697,
            lng: 12.3210436,
            marker: null,
            wiki: "Venezia Santa Lucia railway station", // necessary for Wikipedia API call
            display: ko.observable(1) //set ko.observable to being visibile
        }, {
            name: "Arsenale",
            city: "Venice",
            street: "Castello, 1104",
            lat: 45.4348502,
            lng: 12.3499009,
            marker: null,
            wiki: "Venetian Arsenal", // necessary for Wikipedia API call
            display: ko.observable(1) //set ko.observable to being visibile
        }, {
            name: "Piazza San Marco",
            city: "Venice",
            street: "San Marco, 2044",
            lat: 45.4344187,
            lng: 12.338526,
            marker: null,
            wiki: "Piazza San Marco", // necessary for Wikipedia API call
            display: ko.observable(1) //set ko.observable to being visibile
        }
    ]), //closing observableArray
    infoContent: function (location, callback) {
        // render the info shown in infoWindow
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' + location.wiki + '&callback=wikiCallback';

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback",
            timeout: 8000, // required for jsonp calls and error handling
            success: function (data) {
                var info = '<h2>' + location.name + '</h2>';
                info += '<p>' + location.street + '</p>';
                if (data.hasOwnProperty('query')) {
                    for (var i in data.query.pages) {
                        info += '<br />' + data.query.pages[i].extract;
                    }
                }
                callback(info);
            }
        }).fail(function () { $('body').prepend("<div class='alert alert-danger'>Failed to get wikipedia resources</div>"); });;
    },
    filterMarkers: function () { // adding location selection
        var self = this, info = '';
        this.locations().forEach(function (location) {
            var show = false;
            if (location.name.toLowerCase().indexOf(self.search().toLowerCase()) > -1) {
                show = true;
                location.marker.setMap(map);
                self.infoContent(location, function (info) {
                    infoWindow.setContent(info);
                    infoWindow.open(map, location.marker);
                    toggleBounce(location.marker);
                });
            }
            else { location.marker.setMap(null); }
            location.display(show);
        });
    }
}; // closing myMap

// View Section

// Calling Google Maps API
function initializeMap() { // opening initializeMap function
    infoWindow = new google.maps.InfoWindow();
    var myCoordinates = new google.maps.LatLng(45.4374847, 12.3307717);
    var mapOptions = {
        zoom: 15,
        center: myCoordinates
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); // Iterating with getElementById method and calls Google Map API for various locations
    setMarkers(map, myMap.locations()); // Adding markers to the map based on locations
} //closing initializeMap function

// API error handling
function errorHandling() {
    $('body').prepend("<div class='alert alert-danger'>Failed to load Google Maps API :(</div>");
}

// Animation function
function toggleBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    window.setTimeout(function () { marker.setAnimation(null); }, 2000);
}

// Setting up custom windows based on Google Maps' InfoWindow method
function setMarkers(map, locations) { // opening SetMarkers function

    locations.forEach(function (location, order) {  // opening forEach( iterating the JSON with locations)
        if (location.display()) { // opening if statement (choosing the displayed location and showing details)
            // define the variable required later for markers position
            var myLatLng = new google.maps.LatLng(location.lat, location.lng);

            // defining the SVG icon for markers
            var goldStar = {
                path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
                fillColor: 'red',
                fillOpacity: 0.8,
                scale: 0.1,
                strokeColor: 'gold',
                strokeWeight: 1
            };

            //creating the markers and adding DROP animation
            var marker = new google.maps.Marker({ //  opening marker class
                animation: google.maps.Animation.DROP,
                icon: goldStar,
                map: map,
                position: myLatLng,
                title: location.name,
            }); // closing marker class
            location.marker = marker;

            // adding listener for infoWindow
            google.maps.event.addListener(marker, 'click', (function (marker) { // opening anon function w/marker parameter that returns another function 
                return function () { // opening infoWindow function
                    toggleBounce(marker);
                    var self = this;
                    myMap.infoContent(location, function (info) {
                        infoWindow.setContent(info);
                        infoWindow.open(map, self);
                    });
                }; // closing infoWindow function
            })(marker)); // closing anon function w/marker parameter

        } // closing if statement
    }); // closing forEach
} // closing setMarkers function

// adding listener for triggering the map on load (via initializeMap function)
//google.maps.event.addDomListener(window, 'load', initializeMap);

// applying bindings on knockout.js
ko.applyBindings(myMap);
