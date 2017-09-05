const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const server = require("http").Server(app);
const socket = require("socket.io")(server);
const request = require("request");

const PUBLIC_DIR = "/public/";

app.use(express.static(__dirname + PUBLIC_DIR));

function onConnection(socket) {
  socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
}

socket.on("connection", onConnection);


app.get("/", function(req, res) {
  res.sendFile(PUBLIC_DIR + "index.html");
});



app.post("/process_image", function(req, res) {
  const image = req.body.data;
  if (!image) {
    return res.send({});
  }
  console.log("processing image...");
  processImage(image, function(predictionData) {
    if (predictionData) {
      res.send({prediction: predictionData.prediction, inputImg: predictionData.inputImg});
    }
    else {
      res.send({prediction: -2});
    }
  });
});



function processImage(image, callback) {
  request.post("http://localhost:6969/process_image", {
    json: {
      data: image 
    }
  }, function(err, res, body) {
    //console.log("prediction:", body.prediction);
    if (callback) {
      callback(body);
    }
  });
}


server.listen(process.env.PORT || 3000, function() {
  console.log("server up");
});
