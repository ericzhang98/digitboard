# digitboard

Simple digit recognizer using model trained on MNIST.

Check it out at [https://intense-coast-89920.herokuapp.com](https://intense-coast-89920.herokuapp.com)
(may take a while to load since it's a free heroku dyno and needs to wake up)

To run:
npm start (runs server.js in foreground and ml_server.py in background, make sure to kill -9 ml_server.py if u want to restart)
or do it the regular way: node server.js in one tab, python ml_server.py in the other

The server will run on localhost:3000

TODO: better thresholding against attacks, train model on rotated images, think of something cool to do with sockets, clean up code
