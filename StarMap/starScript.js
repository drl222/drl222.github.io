//   The constellation border data is from http://www.iau.org/public/themes/constellations/
//     but there seem to be a few erroneous data points that I removed:
//     OCT, 00, 03, 12.1551, -89.3039017
//     OCT, 00, 03, 12.1551, -89.3039017
//     OCT, 00, 03, 12.1565, -89.3038940
//
//     I added this point, as well (on both Ursa Minor and Cepheus's borders)
//     so that the border looks properly rounded with a single quadratic Bezier curve:
//     UMI, 03, 48, 11.2200, 88.1164016
//     CEP, 03, 48, 11.2200, 88.1164016

//math constants
var FULL_CIRCLE = 360;
var DEG_TO_RAD = Math.PI / 180;

//dimension, scale and speed constants
var WINDOW_X = 800;
var WINDOW_Y = 500;
var MAIN_DIV_PADDING = 3; //must match CSS
var MAP_SPEED = 2;
var SCALE = 3; //conversion from degree to pixel
var ORTH_SCALE = WINDOW_Y / 2 * SCALE;
var STAR_FAINTEST_MAG = 5.5;
var STAR_SCALE = 1.4;

//data constants
var BORDER_FILE_NAME = "data/ConstellationBorders.csv";
var STAR_FILE_NAME = "data/bsc5.csv";
var NAME_FILE_NAME = "data/ConstellationList.csv";
var NORTH_CONSTELLATION = "UMI";
var SOUTH_CONSTELLATION = "OCT";
var SPLIT_CONSTELLATION = "SER";
var SPLIT_CONSTELLATION_1 = "SER1";

//color and style constants
var TEXT_STYLE = "18px Arial";
var TEXT_HEIGHT = 18; //must match the above TEXT_STYLE
var WORD_COLOR = "#bb0000";
var STAR_COLOR = "#ffffff";
var LINE_COLOR = "#888888";

//enums
var Directions = {LEFT: "left", RIGHT: "right", UP: "up", DOWN: "down"};

//DOM elements
var canvas;
var context;
var navBar = {};
var randConstSpan;
var alreadyFoundP;
var clearBtn;

//movement variables
var mapDirection = null;

//state variables
var borderReady = false;
var starReady = false;
var nameReady = false;
var center = new Point(180, 0);
var currentConstellation;
var clickableRects = {};

//data structures
var borderData = {};
var starData = [];
var centroidList = {};
var constellationNameList = {};
var unfoundConstellationsList = [];

//class definitions
function Point(x, y) {
	this.RA = x;
	this.Dec = y;
}
Point.prototype.toString = function() {
	return "(" + this.RA + ", " + this.Dec + ")";
}
Point.prototype.getX = function() {
	if(!this.orthographicShouldGraph()) return;


	var dRA = this.RA - center.RA;
	var returnValue = Math.cos(this.Dec * DEG_TO_RAD) * Math.sin(dRA * DEG_TO_RAD);

	return WINDOW_X / 2 - (returnValue * ORTH_SCALE);
}
Point.prototype.getY = function() {
	if(!this.orthographicShouldGraph()) return;

	var dRA = this.RA - center.RA;
	var a = Math.cos(center.Dec * DEG_TO_RAD) * Math.sin(this.Dec * DEG_TO_RAD);
	var b = Math.sin(center.Dec * DEG_TO_RAD) * Math.cos(this.Dec * DEG_TO_RAD) * Math.cos(dRA * DEG_TO_RAD);
		
	return WINDOW_Y / 2 - ((a-b) * ORTH_SCALE);
}
/** which points should be ignored? */
Point.prototype.orthographicShouldGraph = function(){
	
	var dRA = this.RA - center.RA;
	var a = Math.sin(center.Dec * DEG_TO_RAD) * Math.sin(this.Dec * DEG_TO_RAD);
	var b = Math.cos(center.Dec * DEG_TO_RAD) * Math.cos(this.Dec * DEG_TO_RAD) * Math.cos(dRA * DEG_TO_RAD);
	
	return (a + b) >= 0;
}

function Star(x, y, mag) {
	this.location = new Point(x, y);
	this.magnitude = mag;
}
Star.prototype.toString = function() {
	return this.location.toString();
};
Star.prototype.getX = function() {
	return this.location.getX();
};
Star.prototype.getY = function() {
	return this.location.getY();
}

function TextRectangle(t, b, l, r) {
	this.top = t;
	this.right = r;
	this.bottom = b;
	this.left = l;
}
TextRectangle.prototype.toString = function() {
	return "(" + this.left + ", " + this.top + ") -- (" + this.right + ", " + this.bottom + ")";
}
TextRectangle.prototype.containsPoint = function(x, y) {
	return (x > this.left && x < this.right
		&& y > this.top && y < this.bottom);
}

window.onload = function() {
	setUpCanvas();
	setUpNavBar();
	setUpRandomizer();
	setUpSaveButtons();

	getBorderData();
	getStarData();
	getNameData();
}

/** put the canvas and context in the global variables,
	and set the canvas's width and height*/
function setUpCanvas(){
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	canvas.setAttribute("width", WINDOW_X);
	canvas.setAttribute("height", WINDOW_Y);
	document.getElementById("main_div").style.height = (WINDOW_Y + MAIN_DIV_PADDING * 2) + "px";

	canvas.addEventListener("mousemove", onMouseMove, false);
	canvas.addEventListener("click", onCanvasClick, false);
}

/** put the nav bar buttons in the global variable,
	and set up event handlers. */
function setUpNavBar() {
	navBar.left = document.getElementById("left_btn");
	navBar.right = document.getElementById("right_btn");
	navBar.up = document.getElementById("up_btn");
	navBar.down = document.getElementById("down_btn");

	navBar.left.addEventListener("mousedown", onMouseDown, false);
	navBar.right.addEventListener("mousedown", onMouseDown, false);
	navBar.up.addEventListener("mousedown", onMouseDown, false);
	navBar.down.addEventListener("mousedown", onMouseDown, false);

	window.addEventListener("mouseup", onMouseUp, false);
}

/** put the save and clear buttons in the global variables,
	and set up their event handlers */
function setUpSaveButtons() {
	clearBtn = document.getElementById("clear_btn");

	clearBtn.addEventListener("click", clear, false);
}

/** put the random constellation span in the global variables,
	and set up the event handler. */
function setUpRandomizer() {
	randConstSpan = document.getElementById("rand_const");
	alreadyFoundP = document.getElementById("already_found");
}

/** put a random constellation inside the randConstSpan from the unfoundConstellationsList
    unless the list is empty already
    this takes care of the split constellation issue */
function getNextConstellation() {
	var theValue;
	if(unfoundConstellationsList.length === 0) {
		win();
		currentConstellation = null;
	} else {
		var theValue = unfoundConstellationsList.pop();
		if(theValue === SPLIT_CONSTELLATION) {
			theValue = SPLIT_CONSTELLATION_1;
		}

		currentConstellation = theValue;
		randConstSpan.innerHTML = constellationNameList[currentConstellation];
	}
}

/** draw the map on the canvas */
function drawMap() {
	//clear everything first
	context.clearRect(0, 0, WINDOW_X, WINDOW_Y);
	clickableRects = {};

	context.font = TEXT_STYLE;
	for(cons in borderData) {
		context.strokeStyle = LINE_COLOR;
		
		//for each point in the constellation
		var consArray = borderData[cons];

		//move to the last point
		var lastPoint = consArray[consArray.length - 1];
		context.beginPath();
		context.moveTo(lastPoint.getX(), lastPoint.getY());

		for(var i = 0; i < consArray.length; i++) {
			var thisPoint = consArray[i];
			drawLineBetween(lastPoint, thisPoint);
			lastPoint = thisPoint;
		}

		context.stroke();
		
		//draw the name at the centroid
		var centr = centroidList[cons];
		var cx = centr.getX();
		if(cx !== undefined) {
			var cy = centr.getY();
			context.fillStyle = WORD_COLOR;
			context.textAlign = "center";
			context.fillText(cons, cx, cy);

			//add it to clickable regions
			var w_1_2 = context.measureText(cons).width / 2;
			var h_1_2 = TEXT_HEIGHT / 2;

			var theRect = new TextRectangle(cy - h_1_2, cy + h_1_2, cx - w_1_2, cx + w_1_2);
			clickableRects[cons] = theRect;
		}

	}


	//for each star
	context.fillStyle = STAR_COLOR;
	for(var i = 0; i < starData.length; i++) {
		var star = starData[i];
		context.beginPath();
		if((STAR_FAINTEST_MAG-star.magnitude)*STAR_SCALE < 0) continue; // too faint or off screen
		context.arc(star.getX(), star.getY(), (STAR_FAINTEST_MAG-star.magnitude)*STAR_SCALE, 0, 2 * Math.PI);
		context.fill();
	}
}

/** get data about the borders of the constellations, from the CSV */
function getBorderData() {
	Papa.parse(BORDER_FILE_NAME, {
		header:true,
		download: true,
		skipEmptyLines: true,
		dynamicTyping: true,
		delimiter: ',',
		complete: function(results) {
			//log any errors in the console
			for(err in results.errors) {
				console.log(results.errors[err]);
			}

			for(var i = 0; i < results.data.length; i++) {
				var cons = results.data[i]["Constellation"];

				if(!borderData.hasOwnProperty(cons)) {
					//if borderData doesn't have this constellation yet, add it!
					borderData[cons] = [];
				}

				var RA = hmsToDegrees(results.data[i]["Hours RA"],
					results.data[i]["Minutes RA"],
					results.data[i]["Seconds RA"]);
				var dec = results.data[i]["Dec"];

				var thePoint = new Point(RA, dec);
				borderData[cons].push(thePoint);
			}

			//initialize centroidList
			for(var cons in borderData) {
				centroidList[cons] = findCentroid(borderData[cons]);
			}
			//special cases: north and south poles
			centroidList[NORTH_CONSTELLATION] = new Point(0, 90);
			centroidList[SOUTH_CONSTELLATION] = new Point(0, -90);

			borderReady = true;
			firstDraw();
		}
	});
}

/** get data about the stars, from the CSV */
function getStarData() {
	Papa.parse(STAR_FILE_NAME, {
		header:true,
		download: true,
		skipEmptyLines: true,
		dynamicTyping: true,
		delimiter: ',',
		complete: function(results) {
			//log any errors in the console
			for(err in results.errors) {
				console.log(results.errors[err]);
			}

			for(var i = 0; i < results.data.length; i++) {

				var RA = hmsToDegrees(results.data[i]["Hours RA"],
					results.data[i]["Minutes RA"],
					results.data[i]["Seconds RA"]);
				var dec = dmsToDegrees(parseInt(results.data[i]["Degrees Dec"]),
					results.data[i]["Minutes Dec"],
					results.data[i]["Seconds Dec"]);

				var mag = results.data[i]["VisualMag"];

				var theStar = new Star(RA, dec, mag);
				starData.push(theStar);
			}

			starReady = true;
			firstDraw();
		}
	});
}

/** get data about the names of the constellations, from the CSV */
function getNameData() {
	Papa.parse(NAME_FILE_NAME, {
		header:false,
		download: true,
		skipEmptyLines: true,
		dynamicTyping: false,
		delimiter: ',',
		complete: function(results) {
			//log any errors in the console
			for(err in results.errors) {
				console.log(results.errors[err]);
			}

			for(var i = 0; i < results.data.length; i++) {
				var abbr = results.data[i][0].toUpperCase();
				var name = results.data[i][1];

				//prepare constellationNameList
				constellationNameList[abbr] = name;

				var li = document.createElement("li");
				var t = document.createTextNode(name + " ");
				li.appendChild(t);
				li.id = abbr;
				alreadyFoundP.appendChild(li);
			}


			nameReady = true;
			firstDraw();
		}
	});
}

/** call draw for the first time, (unless one of the CSV's isn't done being read yet) */
function firstDraw() {
	if(!borderReady || !starReady || !nameReady) return;

	if(localStorage.hasOwnProperty("saveData")) {
		//load data
		unfoundConstellationsList = JSON.parse(localStorage.getItem("saveData"));
	} else {
		//set up unfoundConstellationsList
		for(var cons in constellationNameList) {
			unfoundConstellationsList.push(cons);
		}
		shuffle(unfoundConstellationsList);
	}

	//color the found and unfound constellations
	for(var cons in constellationNameList) {
		var theLI = document.getElementById(cons);
		if(unfoundConstellationsList.indexOf(cons) === -1) {
			//not unfound, i.e. found
			theLI.className = "found";
		} else {
			//unfound
			theLI.className = "unfound";
		}
	}

	getNextConstellation();
	drawMap();
}

/** draw a line between the two Points 
	assume that the turtle's current location is at point a */
function drawLineBetween(a, b) {
	var c = averagePoint(a, b);
	
	var ax = a.getX();
	var ay = a.getY();
	var bx = b.getX();
	var by = b.getY();

	var avgX = c.getX();
	var avgY = c.getY();

	if(isNaN(avgX) || (ax > WINDOW_X && bx > WINDOW_X) || (ax < 0 && bx < 0)
		|| (ay > WINDOW_Y && by > WINDOW_Y) || (ay < 0 && by < 0)) {
		//if it's hidden (avgX is NaN)
		//or if the entire curve (both a and b) is off the screen
		//then just return
		context.moveTo(b.getX(), b.getY());
		return;
	}
	
	//control point
	var cx = 2 * avgX - ax/2 - bx/2;
	var cy = 2 * avgY - ay/2 - by/2;
	
	// draw curve with set coordinates
	context.quadraticCurveTo(cx, cy, bx, by);
	context.lineTo(bx, by);

	return;
}

/** find the average between these two points */
function averagePoint(a, b) {
	var ax = a.RA;
	var bx = b.RA;
	if(ax - bx > FULL_CIRCLE / 2) {
		//bx is too far at the left
		bx += 360;
	} else if (bx - ax > 360 / 2) {
		//ax is too far at the left
		ax += 360;
	}

	return new Point((ax+bx)/2, (a.Dec + b.Dec)/2);
}

/** return the centroid of the polygon with the given vertices (an array)
	assumes no polygon stretches more than half a great circle around horizontally
	this uses a planar method to find the centroid, which is a good approximation except at the poles */
function findCentroid(vertices) {
	//make a copy so that we don't mess anything up
	var copy = []
	for (var i = 0; i < vertices.length; i++) {
		var p = vertices[i];
		copy.push(new Point(p.RA, p.Dec));
	}

	var min = Math.min.apply(null, copy.map(function(a){return a.RA;}));
	var max = Math.max.apply(null, copy.map(function(a){return a.RA;}));

	if(max - min > FULL_CIRCLE / 2) {
		for (var i = 0; i < copy.length; i++) {
			var p = vertices[i];
			if(p.RA < FULL_CIRCLE / 2) {
				copy[i].RA += FULL_CIRCLE;
			}
		}
	}

	//see also http://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon
	var cx = 0;
	var cy = 0;
	var A = 0;

	var last = copy[copy.length - 1];
	for (var i = 0; i < copy.length; i++) {
		var p = copy[i];
		cx += (last.RA  + p.RA )*(last.RA*p.Dec - p.RA*last.Dec);
		cy += (last.Dec + p.Dec)*(last.RA*p.Dec - p.RA*last.Dec);
		A += (last.RA*p.Dec - p.RA*last.Dec);

		last = p;
	}
	
	A /= 2;
	cx /= (6*A);
	cy /= (6*A);
	
	return new Point(cx, cy);
}

/** when a navigation button is clicked */
function onMouseDown(e) {
	var target;
	if(e.srcElement) {target = e.srcElement;} else {target = e.target;}

	switch(target) {
		case navBar.left:
			mapDirection = Directions.LEFT;
			break;
		case navBar.right:
			mapDirection = Directions.RIGHT;
			break;
		case navBar.up:
			mapDirection = Directions.UP;
			break;
		case navBar.down:
			mapDirection = Directions.DOWN;
			break;
		default:
			mapDirection = null;
			break;
	}

	if(mapDirection !== null) {
		window.requestAnimationFrame(moveCenter);
	}
}

/** animate the movement */
function moveCenter() {
	if(mapDirection) {
		switch(mapDirection) {
			case Directions.LEFT:
				center.RA += MAP_SPEED;
				break;
			case Directions.RIGHT:
				center.RA -= MAP_SPEED;
				break;
			case Directions.UP:
				center.Dec += MAP_SPEED;
				break;
			case Directions.DOWN:
				center.Dec -= MAP_SPEED;
				break;
			default:
				break;
		}
		drawMap();
		window.requestAnimationFrame(moveCenter);
	}
}

/** stop any map movement*/
function onMouseUp(e) {
	mapDirection = null;
}

/** check if you move over clickable region */
function onMouseMove(e) {
	var rect = canvas.getBoundingClientRect();
	var mouseX = e.clientX - rect.left;
	var mouseY = e.clientY - rect.top;

	canvas.style.cursor = "default";
	for(var cons in clickableRects) {
		if(clickableRects[cons].containsPoint(mouseX, mouseY)) {
			canvas.style.cursor = "pointer";
		}
	}
}

/** check if you clicked on a clickable region*/
function onCanvasClick(e) {
	var rect = canvas.getBoundingClientRect();
	var mouseX = e.clientX - rect.left;
	var mouseY = e.clientY - rect.top;

	for(var cons in clickableRects) {
		//check if you're in a clickable region
		if(clickableRects[cons].containsPoint(mouseX, mouseY)) {
			//is the clickable region you're looking for?
			if(cons === currentConstellation) {
				var theLI;
				if(cons !== SPLIT_CONSTELLATION_1) {
					theLI = document.getElementById(cons);
				} else {
					theLI = document.getElementById(SPLIT_CONSTELLATION);
				}
				theLI.className = "found";
				getNextConstellation();
				save();
			}
		}
	}
}

/** return the decimal degrees from hour-minute-second format */
function hmsToDegrees(h, m, s) {
	//1 hour    = 15 degrees
	//1 minute  = 1/4 degree
	//1 second  = 1/240 degree
	return h*15 + m/4 + s/240; 
}

/** return the decimal degrees from degree-minute-second format */
function dmsToDegrees(d, m, s) {
	//1 degree = 1 degree
	//1 minute = 1/60 degree
	//1 second = 1/3600 degree
	return d + m/60 + s/3600;
}

/** shuffle an array, in place */
function shuffle(array) {
	//taken from http://bost.ocks.org/mike/shuffle/
	var m = array.length, t, i;

	// While there remain elements to shuffle…
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}

/** call this when you win the game! */
function win() {
	randConstSpan.innerHTML = "&mdash;";
	var winClause = document.createElement("p");
	var winText = document.createTextNode("You've found all eighty-eight constellations! Click \"Clear progress\" to play again.");
	winClause.appendChild(winText);
	document.getElementById("nav_div").appendChild(winClause);
}

/** save the game */
function save() {
	if(currentConstellation !== null) {
		localStorage["saveData"] = JSON.stringify(unfoundConstellationsList.concat(currentConstellation));
	} else {
		localStorage["saveData"] = JSON.stringify(unfoundConstellationsList);
	}
}

/** for debugging purposes: set everything but Leo and Virgo as found in the saved data
function cheat() {
	localStorage["saveData"] = JSON.stringify(["LEO", "VIR"]);
}*/

/** clear saved data */
function clear(e) {
	if(confirm("Are you sure you want to clear all saved data?")) {
		localStorage.clear();
		firstDraw();
	}
}