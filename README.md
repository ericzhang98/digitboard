# digitboard

Simple digit recognizer using model trained on MNIST.

To run:
npm start (runs server.js in foreground and ml_server.py in background, make sure to kill -9 ml_server.py if u want to restart)
or do it the regular way: node server.js in one tab, python ml_server.py in the other

The server will run on localhost:3000

TODO: better thresholding against attacks, train model on rotated images, think of something cool to do with sockets, clean up code
