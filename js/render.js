function CanvasPlotter(canvas){
	this.canvas = document.getElementById(canvas);
	if(this.canvas.getContext)
	{
		this.ctx = this.canvas.getContext("2d");
	}
}
CanvasPlotter.prototype.drawPoint = function(x,y,s,c)
{
	this.ctx.fillStyle = c;
    this.ctx.fillRect (x, y, s, s);
    this.ctx.closePath();
}
CanvasPlotter.prototype.drawCirc = function(x,y,radius,s,c,stroke)
{
	this.ctx.fillStyle = c;
	this.ctx.beginPath();
   	this.ctx.arc(x, y, radius, 0, 360);
   	this.ctx.lineWidth = s;
    this.ctx.fill();
    if(stroke)
    {
    	this.ctx.strokeStyle=stroke;
    	this.ctx.stroke();
    }
    this.ctx.closePath();
}
CanvasPlotter.prototype.drawLine = function(oX,oY,tX,tY,s,c)
{
	this.ctx.beginPath();
	this.ctx.moveTo(oX, oY);
    this.ctx.lineTo(tX, tY);
    this.ctx.lineWidth = s;
    this.ctx.strokeStyle=c
    this.ctx.stroke()
    this.ctx.closePath();
}
CanvasPlotter.prototype.drawTriangle = function( p1X,p1Y, p2X,p2Y, p3X,p3Y, s,c)
{
	this.ctx.beginPath();
	this.ctx.fillStyle = c;
	this.ctx.moveTo(p1X, p1Y);
    this.ctx.lineTo(p2X, p2Y);
    this.ctx.lineTo(p3X, p3Y);
    this.ctx.lineWidth = s;
    this.ctx.fill();
    this.ctx.strokeStyle=c
    this.ctx.stroke()
    this.ctx.closePath();
}
CanvasPlotter.prototype.drawArc = function(oX,oY,cpx,cpy,tX,tY,s,c)
{
	this.ctx.beginPath();
	this.ctx.moveTo(oX, oY);
    this.ctx.quadraticCurveTo(cpx,cpy,tX,tY);
    this.ctx.lineWidth = s;
    this.ctx.strokeStyle=c
    this.ctx.stroke()
    this.ctx.closePath();
}
CanvasPlotter.prototype.getBounds = function()
{
	return {   "sW":$(this.canvas).width()-constants.map_padding,   "sH":$(this.canvas).height()-constants.map_padding    }
}


//////////////////////////////////////////// Plotting functions ////////////////////////////////////////////


function basicPlot(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	
	i = 0;
	var first = true;
	
	var colorStep = 0;
	var cD = true;
	plotStep();
	function plotStep()
	{
		dist = offset + constants.drawing_step;
		if(dist > totalLength) dist = totalLength;
		var first = true;
		for(i=offset; i<dist; i++)
		{
			var lonNV = tracks[i].lon
			var latNV = tracks[i].lat
			
			var x = (lonNV-range.lonRange[0]) / (range.lonRange[1]-range.lonRange[0]) * bounds.sW;
			var y = (latNV-range.latRange[0]) / (range.latRange[1]-range.latRange[0]) * bounds.sH;
			var z = (tracks[i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
			var hr_a = tracks[i].hr/constants.max_heart_rate;
			
			var color = 0;
			var c = "rgba("+(255*hr_a)+","+color+","+color+",1)"
			
			if(colorStep >= 255) cD = false;
			else if(colorStep <= 0) cD = true;
			cD ? colorStep++ : colorStep--;
			
			if(first){
				first = false;
			} 
			plotter.drawPoint(x,y,6*z,c);
		}
		offset += constants.drawing_step;
		if(offset < totalLength) setTimeout(plotStep,10);
	}
}




























function extrudedPlot(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	var scale_offset = constants.map_padding/2;
	
	i = 0;
	var first = true;
	
	var colorStep = 0;
	var cD = true;
	plotStep();
	function plotStep()
	{
		dist = offset + constants.drawing_step;
		if(dist > totalLength) dist = totalLength;
		var first = true;
		for(i=offset; i<dist; i++)
		{
			var lonNV = tracks[i].lon
			var latNV = tracks[i].lat
			
			var x = scale_offset+ (lonNV-range.lonRange[0]) / (range.lonRange[1]-range.lonRange[0]) * bounds.sW;
			var y = scale_offset+ (latNV-range.latRange[0]) / (range.latRange[1]-range.latRange[0]) * bounds.sH;
			var z = (tracks[i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
			var hr_a = tracks[i].hr/constants.max_heart_rate;
						
			if(colorStep >= 255) cD = false;
			else if(colorStep <= 0) cD = true;
			cD ? colorStep+=1 : colorStep-=1;
			
			var r = 255
			var g = Math.ceil(10 + (215*z));
			var b = Math.ceil(10 + (100*z));
			var c = "rgba("+r+","+g+","+b+",.2)";
			var eC = "rgba("+r+","+g+","+b+",.1)";

			if(first){
				//console.log( eC );
				first = false;
			}
			 
			plotter.drawPoint(x,y,1,c);
			plotter.drawPoint(x,y - (170*z),3*hr_a,c);
			plotter.drawLine(  x,  y, x,  y - (170*z),  1,eC)
		}
		offset += constants.drawing_step;
		if(offset < totalLength) setTimeout(plotStep,10);
	}
}





















function circleInfographic(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	var scale_offset = constants.map_padding/2;
	
	var colorStep = 0;
	var cD = true;
	
	var radius = bounds.sW/3;
	var c_step = 0;
	var pi = Math.PI;
	var oS = radius + scale_offset;
	
	drawBackground();
	setTimeout(drawElevationCircle,1000);
	setTimeout(drawHRCircle,10);
	setTimeout(drawCadCircle,50);
	
	function drawBackground()
	{
		plotter.drawCirc(oS,oS,radius+110,1,'#111','#444');
		plotter.drawCirc(oS,oS,radius-10,1,"black",'#444');
		plotter.drawCirc(oS,oS,radius-62,1,"black",'#FF0000');
		plotter.drawCirc(oS,oS,radius-152,1,"black",'#ff9600');
		drawOuterBGLines();
		drawOuterBGCircles();	
	}
	
	
	//Draw lines radiating outward from circle.
	function drawOuterBGLines()
	{
		var rl_step = 0;
		var radLines = setInterval(function()
		{
			var oX = oS+ ((radius-10)*Math.cos(rl_step*pi/180));
			var oY = oS+ ((radius-10)*Math.sin(rl_step*pi/180));
			var modRad = radius+110;
			var tX = oS+ (modRad*Math.cos(rl_step*pi/180));
			var tY = oS+ (modRad*Math.sin(rl_step*pi/180));
			plotter.drawLine(oX,oY,tX,tY,1,"#222");
			rl_step++
			if(rl_step > 360) clearInterval(radLines);
		},5)	
	}
	
	//Draw circles radiating outward, completing grid.
	function drawOuterBGCircles()
	{
		var rc_step = 0;
		var radCircles = setInterval(function()
		{
			var lX = (120/20)*rc_step
			plotter.drawCirc(oS,oS,radius-10+(lX),1,"none",'#222');
			rc_step++;
			if(rc_step  > 20) clearInterval(radCircles);
		},30)	
	}
		
	
	function drawElevationCircle()
	{
		dist = offset + constants.drawing_step;
		if(dist > totalLength) dist = totalLength;
		var first = true;
		for(i=offset; i<dist; i++)
		{
			var ele = tracks[i].ele
			
			var z = (tracks[i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
			var modRad = radius + (100*z)
			var x = oS+ (modRad*Math.cos(c_step*pi/180));
			var y = oS+ (modRad*Math.sin(c_step*pi/180));
			
			var r = 0;
			var g = Math.ceil(40 + (215*z));
			var b = Math.ceil(200 + (55*z));
			var c = "rgba("+r+","+g+","+b+",1)";
			
			plotter.drawPoint(x,y,3*z,c);
			c_step+=  360/totalLength;
		}
		offset += constants.drawing_step;
		if(offset < totalLength) setTimeout(drawElevationCircle,10);
	}
	function drawHRCircle()
	{
		var len = 200;
		for(i=0; i<len; i++)
		{
			var fR = i * (360/len)
			var z = (tracks[i].hr - 60) / (190-60);
			var modRad = radius-60;
			var adjRad = modRad + (40*z);
			var oX = oS+ (modRad*Math.cos(fR*pi/180));
			var oY = oS+ (modRad*Math.sin(fR*pi/180));
			var tX = oS+ (adjRad*Math.cos(fR*pi/180));
			var tY = oS+ (adjRad*Math.sin(fR*pi/180));
			
			var r = Math.ceil(100 + (155*z));
			var g = 0
			var b = 0
			var c = "rgba("+r+","+g+","+b+",1)";
			plotter.drawLine(oX,oY,tX,tY,3,c);
		}
		
	}
	function drawCadCircle()
	{
		var len = 1080;
		for(i=0; i<len; i++)
		{
			var fR = i * (360/len)
			var z = (tracks[i].cad) / (120);
			var modRad = radius-150;
			var adjRad = modRad + (90*z);
			var oX = oS+ (modRad*Math.cos(fR*pi/180));
			var oY = oS+ (modRad*Math.sin(fR*pi/180));
			var tX = oS+ (adjRad*Math.cos(fR*pi/180));
			var tY = oS+ (adjRad*Math.sin(fR*pi/180));
			
			var r = Math.ceil(230 + (25*z));
			var g = 150
			var b = 0
			var c = "rgba("+r+","+g+","+b+",1)";
			plotter.drawLine(oX,oY,tX,tY,1,c);
		}
	}
}




















function renderedPlot(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	var scale_offset = constants.map_padding/2;
	
	var first = true;
	
	var colorStep = 0;
	var cD = true;
	
	var len = 300;
	
	var cpx = 0;
	var cpy = 0;
	
	var oldX = (tracks[0].lon-range.lonRange[0]) / (range.lonRange[1]-range.lonRange[0]) * bounds.sW;
	var oldY = (tracks[0].lat-range.latRange[0]) / (range.latRange[1]-range.latRange[0]) * bounds.sH;
	var oldZ = (tracks[0].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
	var under = false;
	for(i=1; i<len; i++)
	{
		var os_i = Math.floor( (tracks.length/len)*i);
		console.log(os_i)
		var lonNV = tracks[os_i].lon;
		var latNV = tracks[os_i].lat;
		var x = scale_offset+ (lonNV-range.lonRange[0]) / (range.lonRange[1]-range.lonRange[0]) * bounds.sW;
		var y = scale_offset+ (latNV-range.latRange[0]) / (range.latRange[1]-range.latRange[0]) * bounds.sH;
		var z = (tracks[os_i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
		var hr_a = tracks[os_i].hr/constants.max_heart_rate;
	
		var r = Math.ceil(100 + (155*z));
		var g = 255
		var b = 0
		var c = "rgba("+r+","+g+","+b+",1)";
		
		
		plotter.drawCirc(x,y,15,0,'none',"rgba("+r+","+g+","+b+",.2)");
		//plotter.drawArc(oldX,oldY,cpx,cpy,x,y,1,c);
		modY = y -(200*z);
		plotter.drawCirc(x,modY,1+(2*z),0,c,'none');
		plotter.drawLine(x,y,x,modY,1,c)
		
		oldX = x;
		oldY = y;
	}
}



















function mountainPlot(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	
	i = 0;
	var first = true;
	
	var colorStep = 0;
	var cD = true;
	plotStep();
	function plotStep()
	{
		dist = offset + constants.drawing_step;
		if(dist > totalLength) dist = totalLength;
		var first = true;
		for(i=offset; i<dist; i++)
		{
			var lonNV = tracks[i].lon
			var latNV = tracks[i].lat
			
			var x = (lonNV-range.lonRange[0]) / (range.lonRange[1]-range.lonRange[0]) * bounds.sW;
			var y = 100+(latNV-range.latRange[0]) / (range.latRange[1]-range.latRange[0]) * bounds.sH;
			var z = (tracks[i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
			var hr_a = tracks[i].hr/constants.max_heart_rate;

			var base = 100 * z
			var falloff = 25-(25*z);
			var p1X = x - (base/2) -(falloff)
			var p1Y = y;
			var p2X = x;
			var p2Y = y - base;
			var p3X = x + (base/2) +(falloff)
			var p3Y = y;
			
			var color = 0;
			var a = 1//.1 + (.9 * (i/totalLength) );

			var c = "rgba("+(66+parseInt(100*z))+","+(46+parseInt(100*z))+","+(26+parseInt(100*z))+","+a+")"
			if(colorStep >= 255) cD = false;
			else if(colorStep <= 0) cD = true;
			cD ? colorStep++ : colorStep--;
			
			if(first){
				first = false;
			}
			var grd = plotter.ctx.createLinearGradient(p1X,p1Y,p2X,p2Y);
			grd.addColorStop(0,"#598415");
			grd.addColorStop(1,"82cf08");

			plotter.drawTriangle(p1X,p1Y,p2X,p2Y,p3X,p3Y,2,grd);
			plotter.drawPoint(x,p2Y,6*z,'rgba(150,238,10,.5');
		}
		offset += constants.drawing_step;
		if(offset < totalLength) setTimeout(plotStep,10);
	}
}












function waveyPlot(plotter, bounds, range, tracks)
{
	var totalLength = tracks.length;
	var offset = 0;
	var dist;
	var scale_offset = constants.map_padding/2;
	
	i = 0;
	var first = true;
	
	var colorStep = 0;
	var cD = true;
	plotStep();

	var simplified_array = simplifyArray(tracks,10);
	console.log(simplified_array);

	function plotStep()
	{
		dist = offset + constants.drawing_step;
		if(dist > totalLength) dist = totalLength;
		var first = true;
		for(i=offset; i<dist; i++)
		{
			var lonNV = tracks[i].lon
			var latNV = tracks[i].lat
			
			var x = scale_offset+ (lonNV-range.lonRange[0]) / (range.lonRange[1]-range.lonRange[0]) * bounds.sW;
			var y = scale_offset+ (latNV-range.latRange[0]) / (range.latRange[1]-range.latRange[0]) * bounds.sH;
			var z = (tracks[i].ele - range.eleRange[0]) / (range.eleRange[1]-range.eleRange[0]);
			var hr_a = tracks[i].hr/constants.max_heart_rate;
						
			if(colorStep >= 255) cD = false;
			else if(colorStep <= 0) cD = true;
			cD ? colorStep+=1 : colorStep-=1;
			
			var r = 255
			var g = Math.ceil(10 + (215*z));
			var b = Math.ceil(10 + (100*z));
			var c = "rgba("+r+","+g+","+b+",.2)";
			var eC = "rgba("+r+","+g+","+b+",.1)";

			if(first){
				//console.log( eC );
				first = false;
			}
			 
			plotter.drawPoint(x,y,1,c);
			plotter.drawPoint(x,y - (170*z),3*hr_a,c);
			plotter.drawLine(  x,  y, x,  y - (170*z),  1,eC)
		}
		offset += constants.drawing_step;
		if(offset < totalLength) setTimeout(plotStep,10);
	}
}