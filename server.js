const express = require("express");
const app = express();
const server = require("http").Server(app);
const socket = require("socket.io")(server);

const PUBLIC_DIR = "/public/";

app.use(express.static(__dirname + PUBLIC_DIR));

function onConnection(socket) {
  socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
}

socket.on("connection", onConnection);


app.get("/", function(req, res) {
  res.sendFile(PUBLIC_DIR + "index.html");
});





server.listen(process.env.PORT || 3000, function() {
  console.log("server up");
});
