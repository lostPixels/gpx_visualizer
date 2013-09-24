'use strict';

function welcome($scope){
  
}


function welcome($scope, $http) {
  $http.get('mock_data/home.json')
       .then(function(res){
          $scope.recent_rides = res.data.recent_rides;                
        });
};

function newRide($scope, $http) {
	console.log('new ride!')
  $http.get('mock_data/home.json')
       .then(function(res){
          //$scope.recent_rides = res.data.recent_rides;                
        });
};

function rideDetail($scope, $http) {
  $http.get('mock_data/ride.json')
       .then(function(res){
          $scope.ride_details = res.data;                
        });
};



angular.module('gpxRide', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/new', {templateUrl: 'partials/new-ride.html', controller: newRide}).
      when('/ride/:rideId', {templateUrl: 'partials/ride-detail.html', controller: rideDetail}).
      when('/', {templateUrl: 'partials/home.html', controller: welcome}).
      otherwise({redirectTo: '/'});
}]);
