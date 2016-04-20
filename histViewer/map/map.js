'use strict';

var histViewerMap = angular.module('histViewerMap', ['ngRoute']);

histViewerMap.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/map/:who', {
		templateUrl: 'map/map.html',
		controller: 'testController'
	});
}]);

histViewerMap.controller('testController', ['$scope', 'DatabaseControlService', '$location', '$routeParams', function ($scope, DatabaseControlService, $location, $routeParams) {
	$(".se-pre-con").hide();

	$scope.currentView = 'map';
	$scope.latlng = [];
	$scope.latlngcnt;
	$scope.latlngnum;
	$scope.markers = [];
	$scope.consolidatedMarkers = [];
	$scope.descriptions = [];
	$scope.originalDescriptions = [];
	$scope.listeners = [];
	$scope.locations = [];
	$scope.infoBoxes = [];
	$scope.infoWindowMulti;

	var places = [];
	var address = "";

	var mapOfWho = $routeParams.who;
	if (mapOfWho == "") {
		mapOfWho = 'Ludwig van Beethoven';
	}

	DatabaseControlService.queryForWho(mapOfWho).then(function () {//Load the data from the place selected
		initialize();
		var mapItems = DatabaseControlService.getQueryItems();


		places.push(mapItems);
		$scope.latlngnum = places[0].length;
		$scope.latlngcnt = 0;

		$(".se-pre-con").show();

		x = 0;
		loopGeocodeArray(places[0]);

		/*for(var i=0; i < places[0].length; i++) {
		 geoCoder(places[0][i].where, places[0][i].who + " -- " + places[0][i].what + " -- " + places[0][i].when);
		 }*/
	});



	$scope.hideMap = function () {
		$location.path("/main");
	};

	//Asynchronous geocoding call for checking valid input
	var x;
	var loopGeocodeArray = function (arr) {
		if (x < arr.length) {
			doGeocode(arr[x], x, function () {
				// set x to next item
				x++;

				loopGeocodeArray(arr);
			});
		}
		else {
			placeMarkers();
		}
	};

	function placeMarkers() {
		for (var i = 0; i < $scope.locations.length; i++) {
			placeMarker($scope.locations[i]);
		}

		$(".se-pre-con").fadeOut();

	}

	function placeMarker(locationObj) {
		var displayString = locationObj.address.who + " -- " + locationObj.address.what + " -- " + locationObj.address.when;

		$scope.originalDescriptions.push(displayString);
		//$scope.descriptions.push([]);

		$scope.map.setCenter(locationObj.location);

		var infowindow = new google.maps.InfoWindow({
			content: displayString
		});

		$scope.marker = new google.maps.Marker({

			position: locationObj.location,
			title: displayString
		});




		$scope.listeners.push($scope.marker.addListener('click', function () {
			infowindow.open($scope.map, this);
		}));

		$scope.marker.setMap($scope.map);

		$scope.markers.push($scope.marker);

		fitView(locationObj.location);
	}


	//Used along with the above function.
	function doGeocode(address, index, callback) {
		var addr = address.where;
		// Get geocoder instance
		var geocoder = new google.maps.Geocoder();

		// Geocode the address
		geocoder.geocode({'address': addr}, function (results, status) {
			if (status === google.maps.GeocoderStatus.OK && results.length > 0) {

				$scope.locations.push({
					'address':address,
					'location': results[0].geometry.location
				});

				setTimeout(function(){
					callback();
				}, 200);


			}
			else {
				console.log(status);
				setTimeout(function(){
					callback();
				}, 50);
			}
		});
	}



	function initialize () {
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			scrollwheel: false,
			zoom: 12
		});
	}

	function geoCoder(place, description) {
		$scope.geoCoder = new google.maps.Geocoder();

		$scope.geoCoder.geocode({'address': place}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				$scope.map.setCenter(results[0].geometry.location);

				var infowindow = new google.maps.InfoWindow({
					content: description
				});

				$scope.marker = new google.maps.Marker({

					position: results[0].geometry.location,
					title: description
				});

				$scope.markers.push($scope.marker);

				$scope.listeners.push($scope.marker.addListener('click', function () {
					infowindow.open($scope.map, this);
				}));

				$scope.marker.setMap($scope.map);

				fitView(results[0].geometry.location);
			}
			else {
				alert("Geocode was not successful for the following reason: " + status);
			}
		});

	}

	function fitView(loc) {
		$scope.latlng.push(loc);
		$scope.consolidatedMarkers.push(false);
		$scope.latlngcnt++;

		if($scope.latlngcnt == $scope.latlngnum) {
			var latlngbounds = new google.maps.LatLngBounds();
			for (var i = 0; i < $scope.latlngnum; i++) {

				for(var j = 0; j < i; j++){
					if($scope.latlng[i].equals($scope.latlng[j])){
						consolidateMarkers(i, j);
						break;
					}
				}

				latlngbounds.extend($scope.latlng[i]);

			}

			$scope.map.fitBounds(latlngbounds);
		}
	}


	$scope.linkClickedUpdate = function(index){
		//$scope.listeners[index].remove();

		/*$scope.infoWindowMulti = new google.maps.InfoWindow({
			content: $scope.originalDescriptions[index]
		});*/

		$scope.infoWindowMulti.setContent($scope.originalDescriptions[index]);

		//infowindow.open($scope.map, this);

		$scope.markers[index].addListener('click', function () {
			$scope.infoWindowMulti.open($scope.map, this);
		});
	}

	function consolidateMarkers(i, j){


		if($scope.consolidatedMarkers[j] == false){

			//create new marker and overwrite

			$scope.descriptions[j] = "";
			$scope.descriptions[j] = "<a onclick='markerLinkClicked(" + j + ");'>" +places[0][j].who + " " + places[0][j].what + "</a></br>";
			$scope.descriptions[j] +=  "<a onclick='markerLinkClicked(" + i + ");'>" +places[0][i].who + " " + places[0][i].what + "</a></br>";

			$scope.infoWindowMulti = new google.maps.InfoWindow({
				pane: "mapPane",
				enableEventPropagation: false
			});

			/*$scope.descriptions[j][0] = document.createElement("div");
			$scope.descriptions[j][0].id = j;
			$scope.descriptions[j][0].className = places[0][j].who + j;
			$scope.descriptions[j][0].innerHTML = places[0][j].who + " " + places[0][j].what + "</br>";
			document.body.appendChild(document.createTextNode($scope.descriptions[j][0]));

			$scope.descriptions[j][1] = document.createElement("div");
			$scope.descriptions[j][1].id = i;
			$scope.descriptions[j][1].className = places[0][j].who + i;
			$scope.descriptions[j][1].innerHTML = places[0][i].who + " " + places[0][i].what + "</br>";
			document.body.appendChild($scope.descriptions[j][0]);*/

			/*var boxOptions = {
				content: $scope.descriptions[j]
			};

			$scope.infoBoxes[j] = $scope.descriptions[j];*/

			$scope.marker = new google.maps.Marker({

				position: $scope.latlng[j],
				title: "Multiple Events"
			});

			/*var infowindow = new google.maps.InfoWindow({
				content: $scope.descriptions[j]
			});

			$scope.listeners[j] = $scope.marker.addListener('click', function () {
				infowindow.open($scope.map, this);
			});*/

			google.maps.event.addListener($scope.marker,'click',(function(marker, j) {
				return function() {
					$scope.infoWindowMulti.setContent($scope.descriptions[j]);
					$scope.infoWindowMulti.open($scope.map, marker);
					/*google.maps.event.addListener($scope.infoWindowMulti, 'click', (function(i){
						$scope.infoWindowMulti.setContent($scope.originalDescriptions[j]);
						$scope.infoWindowMulti.open($scope.map, this);
					}));*/
				}
			})($scope.marker, j));

			$scope.markers[i].setMap(null);
			$scope.markers[j].setMap(null);

			$scope.marker.setMap($scope.map);

			$scope.markers[j] = $scope.marker;


			$scope.consolidatedMarkers[j] = true;

		}else{

			//add link to partially consolidated marker.
			/*var newDescription = document.createElement("div");
			newDescription.id = i;
			newDescription.className = places[0][j].who + i;
			newDescription.innerHTML = places[0][i].who + " " + places[0][i].what + "</br>";

			$scope.descriptions[j].push(newDescription);
			document.body.appendChild($scope.descriptions[j][$scope.descriptions[j].length - 1]);

			var boxOptions = {
				content: $scope.descriptions[j]
			};

			$scope.infoBoxes[j] = boxOptions;*/

			$scope.descriptions[j] += "<a onclick='markerLinkClicked(" + i + ");'>" +places[0][i].who + " " + places[0][i].what + "</a></br>";

			$scope.infoWindowMulti = new google.maps.InfoWindow({
				pane: "mapPane",
				enableEventPropagation: false
			});

			$scope.marker = new google.maps.Marker({

				position: $scope.latlng[j],
				title: "Multiple Events"
			});

			/*var infowindow = new google.maps.InfoWindow({
				content: $scope.descriptions[j]
			});

			$scope.listeners[j] = $scope.marker.addListener('click', function () {

				infowindow.open($scope.map, this);
			});*/

			google.maps.event.addListener($scope.marker,'click',(function(marker, j) {
				return function() {

					$scope.infoWindowMulti.setContent($scope.descriptions[j]);
					$scope.infoWindowMulti.open($scope.map, marker);
				}
			})($scope.marker, j));


			$scope.markers[i].setMap(null);
			$scope.markers[j].setMap(null);

			$scope.marker.setMap($scope.map);

			$scope.markers[j] = $scope.marker;


		}
	}


	var map_container = $('#map');
	map_container.height($(document).height());

}]);



function markerLinkClicked(index){

	var scope = angular.element(document.getElementById("map")).scope();

	scope.$apply(function(){
		scope.linkClickedUpdate(index);
	});

	return false;

}

