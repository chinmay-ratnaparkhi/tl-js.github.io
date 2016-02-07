'use strict';

angular.module('histViewer', [
	'ngRoute',
	'histViewer.main',
	'histViewer.bubble',
	'histViewer.service'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/main'});
	}]);
