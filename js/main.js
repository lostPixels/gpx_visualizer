function welcome($scope){
  
}



var App = angular.module('homepage', []);

App.controller('welcome', function($scope, $http) {
  $http.get('mock_data/home.json')
       .then(function(res){
          $scope.recent_rides = res.data.recent_rides;                
        });
});