'use strict';

angular.module('histViewer.bubble', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/bubble/:id', {
				templateUrl: 'bubble/bubble.html',
				controller: 'BubbleCtrl'
			});
	}])

	.controller('BubbleCtrl', ['$scope', 'DatabaseControlService', '$location', '$routeParams', function ($scope, DatabaseControlService, $location, $routeParams) {
		$scope.currentView = 'bubble';
		//All the events should still be stored in the service.
		$scope.allItems = DatabaseControlService.getItems();

		var selectedEvent;

		function generateCenterBubble(eventId) {
			alert("Made it to bubble");
		}

		if ($scope.allItems.length < 1) {
			$(".se-pre-con").show();
			DatabaseControlService.ensureDataPopulated().then(function () {
				$scope.allItems = DatabaseControlService.getItems();
				$(".se-pre-con").fadeOut("slow");
				generateCenterBubble(parseInt($routeParams.id));
			});
		}
		else {
			generateCenterBubble(parseInt($routeParams.id));
		}

	}]);