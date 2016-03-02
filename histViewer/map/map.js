'use strict';

var histViewerMap = angular.module('histViewerMap', ['ngRoute']);

histViewerMap.config(['$routeProvider', function($routeProvider){
	$routeProvider.when('/map',{
		templateUrl: 'map/map.html',
		controller: 'testController'
	});
}]);

histViewerMap.controller('testController', ['$scope', 'DatabaseControlService', function($scope, $DatabaseControlService){
	$(".se-pre-con").hide();
	
		$scope.allItems = DatabaseControlService.getItems();
		
		var currentItem = $scope.allItems[0];
		var address = currentItem.where;

		$scope.geoCoder = new google.maps.Geocoder();
		
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			scrollwheel: false,
			zoom: 12
		  });
		  
		
		
		$scope.geoCoder.geocode( { 'address': address}, function(results, status) {
		  if (status == google.maps.GeocoderStatus.OK) {
			  
			$scope.map.setCenter(results[0].geometry.location);
			
			$scope.marker = new google.maps.Marker({
				
				position: results[0].geometry.location,
				title: currentItem.what
			});
			
			$scope.marker.setMap($scope.map);
			
		  } else {
			alert("Geocode was not successful for the following reason: " + status);
		  }
		});

	var map_container = $('#map');
	map_container.height($(document).height());
	
}]);

