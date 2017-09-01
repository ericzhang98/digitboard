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
  const data = req.body.data;
  if (!data) {
    return res.send({});
  }
  console.log("processing image...");
  processImage(data, function(prediction) {
    res.send({prediction: prediction});
  });
});



function processImage(image, callback) {
  request.post("http://localhost:6969/process_image", {
    json: {
      data: image 
    }
  }, function(err, res, body) {
    console.log("prediction:", body);
    if (callback) {
      callback(body);
    }
  });
}


server.listen(process.env.PORT || 3000, function() {
  console.log("server up");
});
