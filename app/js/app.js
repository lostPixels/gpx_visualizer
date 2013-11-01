'use strict';


// Declare app level module which depends on filters, and services
angular.module('gpxRide', [
  'ngRoute',
  'gpxRide.filters',
  'gpxRide.services',
  'gpxRide.directives',
  'gpxRide.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/edit/:id', {templateUrl: 'partials/edit-ride.html', controller: 'editCtrl'});
  $routeProvider.when('/ride/:id', {templateUrl: 'partials/ride-detail.html', controller: 'viewCtrl'});
  $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'welcomeCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);
