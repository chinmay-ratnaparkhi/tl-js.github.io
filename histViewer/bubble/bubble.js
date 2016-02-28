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

		var currentItem;
		$scope.history = [];
		var currentBubble;

		function wildcard(str, rule) {
			return new RegExp("^" + rule.replace("*", ".*") + "$").test(str);
		}

		function shuffle(array) {
			var currentIndex = array.length, temporaryValue, randomIndex;

			while (0 !== currentIndex) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			return array;
		}

		function getAssociatedItems(currItem, type) {
			var items = [];
			$scope.allItems.forEach(function(item) {
				var typeString = item[type];
				if(wildcard(typeString, "*" + currItem[type] + "*")) {
					items.push(item);
				}
			});

			if(items.length > 9) {
				items = shuffle(items).slice(0,9);
			}

			return items;
		}

		function getEventById (id) {
			for (var i in $scope.allItems) {
				if ($scope.allItems[i].id == id) {
					return $scope.allItems[i];
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
			$scope.centerBubbleText = currentItem.what;
			$scope.centerBubbleTitle = currentItem.who;

			//Here is where we would call a function that finds the links that are associated with the center bubble
			var assocItems = getAssociatedItems(currentItem);

			var linkAmount = $scope.allItems.length % 9;
			linkAmount = 5;
			var startDegree;
			var degreeSpacing = 0;
			switch (linkAmount) {
				case 1:
					startDegree = 270;
					break;
				case 2:
					startDegree = 0;
					break;
				case 3:
					startDegree = 30;
					break;
				case 4:
					startDegree = 45;
					//startDegree = 0;
					break;
				case 5:
					startDegree = 54; //The extra one will be at angle 270 (top)
					//startDegree = 18; //The extra one will be at angle 90 (bottom)
					break;
				case 6:
					startDegree = 0; //symmetric about the y
					//startDegree = 30; //symmetric about the x
					break;
				case 7:
					startDegree = 39; //The extra one will be at the bottom
					//startDegree = 15; //The extra one will be at the top
					break;
				case 8:
					startDegree = 23; //There are 2 bubbles in each quadrant
					//startDegree = 0; //There are 4 on the axes and 4 in the quadrants
					break;
				case 9:
					startDegree = 10; //The extra one will be at the bottom
					//startDegree = 30; //The extra one will be at the top
					break;
				default:
					startDegree = 0;
					break;
			}

			if (linkAmount != 0) {
				degreeSpacing = Math.floor(360/linkAmount);
			}

			$scope.bubble1 = false;
			$scope.bubble2 = false;
			$scope.bubble3 = false;
			$scope.bubble4 = false;
			$scope.bubble5 = false;
			$scope.bubble6 = false;
			$scope.bubble7 = false;
			$scope.bubble8 = false;
			$scope.bubble9 = false;

			if (linkAmount > 0) {
				$scope.bubble1 = true;
			}
			if (linkAmount > 1) {
				$scope.bubble2 = true;
			}
			if (linkAmount > 2) {
				$scope.bubble3 = true;
			}
			if (linkAmount > 3) {
				$scope.bubble4 = true;
			}
			if (linkAmount > 4) {
				$scope.bubble5 = true;
			}
			if (linkAmount > 5) {
				$scope.bubble6 = true;
			}
			if (linkAmount > 6) {
				$scope.bubble7 = true;
			}
			if (linkAmount > 7) {
				$scope.bubble8 = true;
			}
			if (linkAmount > 8) {
				$scope.bubble9 = true;
			}

			var newBubbles = [];
			var degree = startDegree;
			var bubbleNum = 0;
			for (var i = 0; i < linkAmount; i++) {
				var link = $scope.allItems[i];
				newBubbles.push({
					"id":++bubbleNum,
					"icon":'fa-link',
					"text": link.who,
					"class": "deg-" + degree,
					"linkUrl":"",
					"eventID": link.id
				});
				degree += degreeSpacing;
			}

			$scope.bubbles = newBubbles;
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

		$scope.bubbleClick = function (num) {
			currentBubble = $scope.bubbles[num-1];
			debugger;
			generateBubbles(currentBubble.id, true);
		};

		//Calculate the font-size for the view
		var container = document.getElementById("bubble-container");
		var control_container = document.getElementById("control-container");
		var history_list = document.getElementById("history-list");
		var html = document.documentElement;

		var height = html.clientHeight;

		var neededFontSize = Math.floor(height/37);
		container.setAttribute("style", "font-size:" + neededFontSize + "px;");

		control_container.setAttribute("style", "height:" + (height - (2 * neededFontSize)) + "px");
		history_list.setAttribute("style", "height:" + (height - (2 * neededFontSize) - 100) + "px");

		window.onresize = function () {
			height = html.clientHeight;

			var neededFontSize = Math.floor(height/37);

			control_container.setAttribute("style", "height:" + (height - (2 * neededFontSize)) + "px");

			container.setAttribute("style", "font-size:" + neededFontSize + "px;");
			history_list.setAttribute("style", "height:" + (height - (2 * neededFontSize) - 100) + "px");
		};

	}]);