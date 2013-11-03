'use strict';

/* Directives */


angular.module('gpxRide.directives', [])




.directive('ngFileSelect', ['$parse', '$http',
	function($parse, $http) {
		return function(scope, elem, attr) {
			var fn = $parse(attr['ngFileSelect']);
			elem.bind('change', function(evt) {
				var files = [],
					fileList, i;
				fileList = evt.target.files;
				if (fileList != null) {
					for (i = 0; i < fileList.length; i++) {
						files.push(fileList.item(i));
					}
				}
				scope.$apply(function() {
					fn(scope, {
						$files: files,
						$event: evt
					});
				});
			});
			elem.bind('click', function() {
				this.value = null;
			});
		};
	}
])
	.directive('ngFileDropAvailable', ['$parse', '$http',
		function($parse, $http) {
			return function(scope, elem, attr) {
				if ('draggable' in document.createElement('span')) {
					var fn = $parse(attr['ngFileDropAvailable']);
					if (!scope.$$phase) {
						scope.$apply(function() {
							fn(scope);
						});
					} else {
						fn(scope)
					}
				}
			};
		}
	])
	.directive('ngFileDrop', ['$parse', '$http',
		function($parse, $http) {
			return function(scope, elem, attr) {
				if ('draggable' in document.createElement('span')) {
					var fn = $parse(attr['ngFileDrop']);
					elem[0].addEventListener("dragover", function(evt) {
						evt.stopPropagation();
						evt.preventDefault();
						elem.addClass("dragover");
					}, false);
					elem[0].addEventListener("dragleave", function(evt) {
						elem.removeClass("dragover");
					}, false);
					elem[0].addEventListener("drop", function(evt) {
						evt.stopPropagation();
						evt.preventDefault();
						elem.removeClass("dragover");
						var files = [],
							fileList = evt.dataTransfer.files,
							i;
						if (fileList != null) {
							for (i = 0; i < fileList.length; i++) {
								files.push(fileList.item(i));
							}
						}
						scope.$apply(function() {
							fn(scope, {
								$files: files,
								$event: evt
							});
						});
					}, false);
				}
			};
		}
	])


.directive('drawingCanvas', function(config, $render){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		 scope: {
		 	drawFn:'&'
		 }, // {} = isolate, true = child, false/undefined = no change
		// cont­rol­ler: function($scope, $element, $attrs, $transclue) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		 restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		 template: '<canvas id="render-canvas" width="600" height="600"></canvas>',
		// templateUrl: '',
		 replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs) {
			
			var w = angular.element(window);
			var ctx;
			var canvas;

			function resizeCanvas()
			{
				iElm.attr('width',window.innerWidth);
				iElm.attr('height',window.innerHeight);
			}

			w.bind('resize',resizeCanvas);
			resizeCanvas();

			canvas = iElm[0];

			if(canvas.getContext)
			{
				ctx = canvas.getContext("2d");
			}
			else{
				alert("canvas not supported");
			}

			$scope.drawingtools = {};

			$scope.drawingtools.clear = function()
			{
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}

			$scope.drawingtools.drawPoint = function(x,y,s,c)
			{
				ctx.fillStyle = c;
			    ctx.fillRect (x, y, s, s);
			    ctx.closePath();
			}
			$scope.drawingtools.drawCirc = function(x,y,radius,s,c,stroke)
			{
				ctx.fillStyle = c;
				ctx.beginPath();
			   	ctx.arc(x, y, radius, 0, 360);
			   	ctx.lineWidth = s;
			    ctx.fill();
			    if(stroke)
			    {
			    	ctx.strokeStyle=stroke;
			    	ctx.stroke();
			    }
			    ctx.closePath();
			}
			$scope.drawingtools.drawLine = function(oX,oY,tX,tY,s,c)
			{
				ctx.beginPath();
				ctx.moveTo(oX, oY);
			    ctx.lineTo(tX, tY);
			    ctx.lineWidth = s;
			    ctx.strokeStyle=c
			    ctx.stroke()
			    ctx.closePath();
			}
			$scope.drawingtools.drawTriangle = function( p1X,p1Y, p2X,p2Y, p3X,p3Y, s,c)
			{
				ctx.beginPath();
				ctx.fillStyle = c;
				ctx.moveTo(p1X, p1Y);
			    ctx.lineTo(p2X, p2Y);
			    ctx.lineTo(p3X, p3Y);
			    ctx.lineWidth = s;
			    ctx.fill();
			    ctx.strokeStyle=c
			    ctx.stroke()
			    ctx.closePath();
			}
			$scope.drawingtools.drawArc = function(oX,oY,cpx,cpy,tX,tY,s,c)
			{
				ctx.beginPath();
				ctx.moveTo(oX, oY);
			    ctx.quadraticCurveTo(cpx,cpy,tX,tY);
			    ctx.lineWidth = s;
			    ctx.strokeStyle=c
			    ctx.stroke()
			    ctx.closePath();
			}
			$scope.drawingtools.getBounds = function()
			{
				return {   "sW":iElm[0].clientWidth,   "sH":iElm[0].clientHeight    }
			}


			
			$scope.theta = { x:0,y:0 }

			var startTheta = { x:0,y:0 }
			var startPoint = { x:0,y:0 }


			function adjustTheta(e)
			{
				$scope.theta.x = startTheta.x + (startPoint.x - e.offsetX);
				$scope.theta.y = startTheta.y + (startPoint.y - e.offsetY);

				$render.adjustTheta($scope.theta.x, $scope.theta.y);
			}

			iElm.on('mousedown',function(e)
			{
				startPoint = { x:e.offsetX, y:e.offsetY }
				startTheta = {x:$scope.theta.x, y:$scope.theta.y}

				iElm.on('mousemove',adjustTheta);
				w.on('mouseup',function()
				{
					iElm.unbind('mousemove',adjustTheta);
				})
			})


			$scope.drawFn({plotFn:$scope.drawingtools});
		}
	};
});






