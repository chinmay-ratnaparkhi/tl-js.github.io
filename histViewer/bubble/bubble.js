'use strict';

angular.module('histViewer.bubble', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/bubble/:id', {
				templateUrl: 'bubble/bubble.html',
				controller: 'BubbleCtrl'
			});
	}])

	//.filter('reverse', function() {
	//	return function(items) {
	//		return items.slice().reverse();
	//	};
	//})

	.controller('BubbleCtrl', ['$scope', 'DatabaseControlService', '$location', '$routeParams', function ($scope, DatabaseControlService, $location, $routeParams) {
		$scope.currentView = 'bubble';
		//All the events should still be stored in the service.
		$scope.allItems = DatabaseControlService.getItems();

		var selectedEvent;

		var currentItem;
		$scope.history = [];
		var currentBubble;
		var gotoId;

		function getEventById (id) {
			for (var i in $scope.allItems) {
				if ($scope.allItems[i].id = id) {
					return $scope.allItems[i].id;
				}
			}
			return {}; //Should never hit this case
		}

		function generateBubbles(eventId, updateHistory) {
			if (updateHistory) {
				var itemToAdd = {
					"num": $scope.history.length,
					"id": currentItem.id,
					"name": currentItem.who
				};
				$scope.history.push(itemToAdd);
			}
			currentItem = getEventById(eventId);
			var centerDiv = document.getElementById("centerDiv");
			//Do work on generating the background picture or some sort of picture
		}

		if ($scope.allItems.length < 1) {
			$(".se-pre-con").show();
			DatabaseControlService.ensureDataPopulated().then(function () {
				$scope.allItems = DatabaseControlService.getItems();
				$(".se-pre-con").fadeOut("slow");
				generateBubbles(parseInt($routeParams.id), false);
			});
		}
		else {
			generateBubbles(parseInt($routeParams.id), false);
		}

	}]);