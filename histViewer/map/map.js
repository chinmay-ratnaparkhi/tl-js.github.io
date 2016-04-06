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

	var places = [];
	var address = "";

	var mapOfWho = $routeParams.who;
	if (mapOfWho == "") {
		mapOfWho = 'Ludwig van Beethoven';
	}

	$scope.hideMap = function () {
		$location.path("/main");
	};

	DatabaseControlService.queryForWho(mapOfWho).then(function () {//Load the data from the place selected
		initialize();
		var mapItems = DatabaseControlService.getQueryItems();


		places.push(mapItems);
		$scope.latlngnum = places[0].length;
		$scope.latlngcnt = 0;

		for(var i=0; i < places[0].length; i++) {
			geoCoder(places[0][i].where, places[0][i].who + " -- " + places[0][i].what + " -- " + places[0][i].when);
		}
	});

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

				$scope.marker.addListener('click', function () {
					infowindow.open($scope.map, $scope.marker);
				});

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
		$scope.latlngcnt++;

		if($scope.latlngcnt == $scope.latlngnum) {
			var latlngbounds = new google.maps.LatLngBounds();
			for (var i = 0; i < $scope.latlngnum; i++) {
				latlngbounds.extend($scope.latlng[i]);
			}

			$scope.map.fitBounds(latlngbounds);
		}
	}

	var map_container = $('#map');
	map_container.height($(document).height());

}]);

