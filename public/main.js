'use strict';

/*
var canvas = $("canvas.whiteboard");
var canvasDOM = canvas[0];
var context = canvasDOM.getContext("2d");

canvasDOM.addEventListener("mousedown", onMouseDown, false);
canvasDOM.addEventListener("mouseup", onMouseUp, false);
canvasDOM.addEventListener("mousemove", throttle(onMouseMove, 10), false);
var lastPoint = {};
var color = "black";
var drawing = false;


function onMouseDown(event) {
  drawing = true;
  const offset = canvas.offset();
  const x = event.pageX - offset.left;
  const y = event.pageY - offset.top;
  lastPoint = {x, y};
}

function onMouseUp(event) {
  if (drawing) {
    drawing = false;
    const offset = canvas.offset();
    const x = event.pageX - offset.left;
    const y = event.pageY - offset.top;
    drawLine(lastPoint.x, lastPoint.y, x, y, color, true);
  }
}

function onMouseMove(event) {
  if (drawing) {
    console.log(canvas.offset());
    const offset = canvas.offset();
    const x = event.pageX - offset.left;
    const y = event.pageY - offset.top;
    drawLine(lastPoint.x, lastPoint.y, x, y, color, true);
    lastPoint = {x, y};
  }
}


function drawLine(x0, y0, x1, y1, color, emit) {
  console.log(x0 + " " + y0 + " " + x1 + " " + y1);
	context.beginPath();
	context.moveTo(x0, y0);
	context.lineTo(x1, y1);
	context.strokeStyle = color;
	context.lineWidth = 2;
	context.stroke();
	context.closePath();
}
*/


var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color');
var context = canvas.getContext('2d');

var current = {
	color: 'black'
};
var drawing = false;

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

function onMouseDown(e){
	drawing = true;
  const x = e.pageX - canvas.offsetLeft;
  const y = e.pageY - canvas.offsetTop;
	current.x = x;
	current.y = y;
}

function onMouseUp(e){
	if (!drawing) { return; }
	drawing = false;
  const x = e.pageX - canvas.offsetLeft;
  const y = e.pageY - canvas.offsetTop;
	drawLine(current.x, current.y, x, y, current.color, true);
}

function onMouseMove(e){
	if (!drawing) { return; }
  const x = e.pageX - canvas.offsetLeft;
  const y = e.pageY - canvas.offsetTop;
	drawLine(current.x, current.y, x, y, current.color, true);
	current.x = x;
	current.y = y;
}





function drawLine(x0, y0, x1, y1, color, emit){
	context.beginPath();
	context.moveTo(x0, y0);
	context.lineTo(x1, y1);
	context.strokeStyle = color;
	context.lineWidth = 2;
	context.stroke();
	context.closePath();
}

onResize();
function onResize() {
  console.log(canvas.width);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

// limit the number of events per second
function throttle(callback, delay) {
	var previousCall = new Date().getTime();
	return function() {
		var time = new Date().getTime();

		if ((time - previousCall) >= delay) {
			previousCall = time;
			callback.apply(null, arguments);
		}
	};
}
