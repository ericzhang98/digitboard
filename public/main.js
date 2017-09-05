'use strict';
const socket = io(); 
const button = document.getElementsByClassName("process-image-btn")[0];
button.onclick = function() {
  clear();
};

const label = document.getElementsByClassName("prediction-label")[0];
const img = document.getElementsByClassName("input-img")[0];

const canvas = document.getElementsByClassName('whiteboard')[0];
const context = canvas.getContext('2d');
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
canvas.addEventListener('touchstart', onTouchStart, false);
canvas.addEventListener('touchend', onTouchEnd, false);
canvas.addEventListener('touchmove', throttle(onTouchMove, 10), false);

var current = {};
var drawing = false;

// event listeners
function onMouseDown(e) {
	drawing = true;
  const x = e.pageX - canvas.offsetLeft - 5;
  const y = e.pageY - canvas.offsetTop - 5;
	current.x = x;
	current.y = y;
}

function onMouseUp(e) {
	if (drawing) {
    drawing = false;
    const x = e.pageX - canvas.offsetLeft - 5;
    const y = e.pageY - canvas.offsetTop - 5;
    drawLine(current.x, current.y, x, y, false);
    makePrediction();
  }
}

function onMouseMove(e) {
  if (drawing) {
    const x = e.pageX - canvas.offsetLeft - 5;
    const y = e.pageY - canvas.offsetTop - 5;
    drawLine(current.x, current.y, x, y, false);
    current.x = x;
    current.y = y;
  }
}

function onTouchStart(e) {
  e.preventDefault();
  onMouseDown(e);
  return false;
}

function onTouchEnd(e) {
  e.preventDefault();
  onMouseUp(e);
  return false;
}

function onTouchMove(e) {
  e.preventDefault();
  onMouseMove(e);
  return false;
}

// throttled upload and process call
const makePrediction = throttle(function() {
  const base64Data = canvas.toDataURL().split(",")[1];
  console.log(base64Data);
  uploadAndProcessImage(base64Data);
}, 100);

// server prediction call
function uploadAndProcessImage(base64Data) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/process_image", true);
  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      const response = JSON.parse(xhr.responseText);
      console.log(response);
      if (response.prediction != null && response.prediction != -1) {
        if (response.prediction != -2) {
          label.innerHTML = "Digit prediction: " + response.prediction;
        }
        else {
          label.innerHTML = "Backend still starting up lol (wait like 10 sec)";
        }
      }
      else {
        label.innerHTML = "Digit prediction: none";
      }
      if (response.inputImg) {
        const inputImgData = "data:image/png;base64," + response.inputImg;
        img.src = inputImgData;
      }
    }
  };
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({data: base64Data}));
  console.log("SENDING");
}


function clear() {
  context.fillRect(0, 0, canvas.width, canvas.height);
  label.innerHTML = "Digit prediction: ";
  img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
}

function drawLine(x0, y0, x1, y1, emit) {
	context.beginPath();
	context.moveTo(x0, y0);
	context.lineTo(x1, y1);
	context.strokeStyle = "black";
	context.lineWidth = 2;
	context.stroke();
	context.closePath();

  if (emit) {
    // emit drawing data in terms of percentage
    var w = canvas.width;
    var h = canvas.height;
    socket.emit("drawing", {
      x0: x0/w,
      y0: y0/h,
      x1: x1/w,
      y1: y1/h
    });
  }
}

//window.addEventListener('resize', setup, false);
setup();
function setup() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

// return function with a delay check
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

// respond to drawing changes
socket.on('drawing', onDrawingEvent);
function onDrawingEvent(data){
	var w = canvas.width;
	var h = canvas.height;
	drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, false);
}
