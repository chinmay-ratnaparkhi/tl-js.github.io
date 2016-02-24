'use strict';

var histViewerMap = angular.module('histViewerMap', ['ngRoute']);

histViewerMap.config(['$routeProvider', function($routeProvider){
	$routeProvider.when('/map',{
		templateUrl: 'map/map.html',
		controller: 'testController'
	});
});

histViewerMap.controller('testController',function($scope){

		$scope.geoCoder = new google.maps.Geocoder();
		
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			scrollwheel: false,
			zoom: 12
		  });
		  
		var address = "Lawrence, KS";
		
		$scope.geoCoder.geocode( { 'address': address}, function(results, status) {
		  if (status == google.maps.GeocoderStatus.OK) {
			  
			$scope.map.setCenter(results[0].geometry.location);
			
			$scope.marker = new google.maps.Marker({
				
				position: results[0].geometry.location,
				title: "Hello world!"
			});
			
			$scope.marker.setMap($scope.map);
			
		  } else {
			alert("Geocode was not successful for the following reason: " + status);
		  }
		});
	
});

