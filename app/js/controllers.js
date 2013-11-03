'use strict';

/* Controllers */

angular.module('gpxRide.controllers', [])




	.controller('welcomeCtrl', [function() {

	}])





	.controller('editCtrl', ['$scope','Rides','$routeParams','$upload','config','$render','$gpx',function($scope,Rides,$routeParams,$upload,config,$render,$gpx) {

		var ride;
		if($routeParams.id == 'new')
		{
			ride = Rides.create();
		}
		else{
			ride = Rides.get($routeParams.id);
		}

		$scope.ride = ride;
		$scope.rendermodes = $render.types;


		$scope.selectedFiles = [];
        $scope.progress = [];

        $scope.setPlotter = function(Plotter)
        {
        	$scope.Plotter = Plotter;
        }
        $scope.render = function()
        {
        	$render.start();
        }

        $scope.saveRide = function()
        {
        	Rides.save()
        	.success(function(data)
        	{
        		console.log("Ride Saved",data)
        		ride.url = config.urls.root+"#/ride/"+data.id;
        	})
        	.error(function(data)
        	{
        		console.warn("ERROR: Ride not saved",data)
        	})
        }

        $scope.onFileSelect = function($files) {
			$scope.uploadResult = [];
			$scope.selectedFiles = $files;
			for ( var i = 0; i < $files.length; i++) {
				var $file = $files[i];
				$scope.progress[i] = 0;
				
				(function() {
					var index = i; 
					$upload.upload({
						url : 'file_manager.php',
						headers: {'myHeaderKey': 'myHeaderVal'},
						data : {
							myModel : $scope.myModel
						},
						file : $file,
						fileFormDataName: 'file',
						progress: function(evt) {
							$scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
							if (!$scope.$$phase) {
								$scope.$apply();
							}
						}
					}).success(function(data, status, headers, config) {
						if(data.result == 'success')
						{
							fileUploaded(data);
						}
						else{
							console.warn(data,status,headers)
							alert('issue uploading file!');
						}
					});
				})();
			}
		}

		function fileUploaded(data)
        {
        	ride.gpx = data.file_path;
	       
        	Rides.loadGPX(data.file_path,function(data) //This is a blocking function
        	{
        		$scope.ride_viewable = true;
        		
        		$gpx.parse(data)
        		.then(function(result){
        			//plotPoints(result.tracks, result.range);
        			$render.set($scope.Plotter, result.range, result.tracks);
        		})
        		
        	}); 
        }
		
		// function plotPoints(tracks, range)
		// {
		// 	$render.set($scope.Plotter, range, tracks);
		// }

	}])










	.controller('viewCtrl', ['$scope','Rides','$routeParams','$gpx','$render',function($scope,Rides,$routeParams,$gpx,$render) {

		var promise = Rides.get($routeParams.id);
		
		promise.then(function(ride)
		{
			$scope.ride = ride;
			console.log("load:",ride.file_url)
			Rides.loadGPX(ride.file_url,function(data) //This is a blocking function
        	{
        		$scope.ride_viewable = true;
        		
        		$gpx.parse(data)
        		.then(function(result){
        			$render.set($scope.Plotter, result.range, result.tracks);
        		})
        		
        	}); 
		})

		$scope.setPlotter = function(Plotter)
        {
        	$scope.Plotter = Plotter;
        }
        $scope.render = function()
        {
        	$render.start();
        }

	}]);