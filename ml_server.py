import numpy
import keras
import matplotlib
from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation, Flatten
from keras.layers import Convolution2D, MaxPooling2D
from keras.utils import np_utils
from keras.datasets import mnist
from keras.callbacks import ModelCheckpoint
from matplotlib import pyplot as plt
import base64
from scipy import misc, ndimage
from cStringIO import StringIO
from skimage.feature import peak_local_max
from skimage import data, img_as_float

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import json

numpy.random.seed(6969)

print "finished loading modules..."

# set up model architecture
print "setting up architecture..."

# sequential model format
model = Sequential()

# CNN input layer :thinking_face:
model.add(Convolution2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)))

# add more layers?
model.add(Convolution2D(32, (3, 3), activation="relu"))
model.add(MaxPooling2D(pool_size=(2,2)))
model.add(Dropout(0.25))

# add fully connected layer and output layer
model.add(Flatten())
model.add(Dense(128, activation="relu"))
model.add(Dropout(0.5))
model.add(Dense(10, activation="softmax"))

# add best weights from before
model.load_weights("model_weights_final.hdf5")

# compile the model
model.compile(loss="categorical_crossentropy", optimizer="adam",
        metrics=["accuracy"])

# prediction helpers
def predicted_digit(prediction):
    for i in range(0, len(prediction)):
        if prediction[i] >= 0.9:
            return i
    return -1

def predicted_digits(predictions):
    digits = []
    for i in range(0, predictions.shape[0]):
        digits.append(predicted_digit(predictions[i]))
    return digits

# base64 <-> img <-> arr helper functions, need to convert nxnx1 arr to nxn
def numpyArrayToImage(arr):                     
    return misc.toimage(arr)  

def imageToNumpyArray(img):                     
    return misc.fromimage(img)  

def numpyArrayToBase64(arr):
    output = StringIO()
    misc.imsave(output, arr, format='png')
    img_data = output.getvalue() 
    base64_string = base64.b64encode(img_data)  
    return base64_string        

def base64ToNumpyArray(base64_string):          
    img_data = base64.b64decode(base64_string)  
    arr = misc.imread(StringIO(img_data))            
    return arr   

def imageToBase64(img):
    output = StringIO()
    misc.imsave(output, img, format='png')
    img_data = output.getvalue() 
    base64_string = base64.b64encode(img_data)  
    return base64_string  

def base64ToImage(base64_string):               
    arr = base64ToNumpyArray(base64_string)     
    img = misc.toimage(arr)                     
    return img 

def grayscale(arr):                       
    img = misc.toimage(arr)           
    grayscale = img.convert("L")                      
    grayscale_arr = numpy.array(grayscale)             
    return grayscale_arr                               
                                                       
def rgba(arr):
    img = misc.toimage(arr)
    rgba = img.convert("RGBA")
    rgba_arr = numpy.array(rgba)
    return rgba_arr

def convert(arr, format_str):
    img = misc.toimage(arr)
    converted_img = img.convert(format_str)
    converted_arr = numpy.array(converted_img)
    return converted_arr

def process_2Darr(arr):
    if len(arr.shape) == 2 and arr.shape[0] == 28 and arr.shape[1] == 28: 
        predictions = model.predict(numpy.array([arr.reshape(28, 28, 1)]))
        digits = predicted_digits(predictions)
        return digits[0]
    return -1

def downsample(img):
    img = img_as_float(img)
    img_max = ndimage.maximum_filter(img, size=20, mode="constant")
    img_max = misc.imresize(img_max, 0.1)
    return img_max

# find offset from start to next vector position matching criteria along an axis 
def offset(img, start, reverse, axis):
    if axis == 1:
        img = numpy.rot90(img, 1, (1, 0))
    if reverse:
        img = numpy.rot90(img, 2, (0,1)) #flip if inverse
        
    for x in range(start, img.shape[0]):
        if numpy.sum(img[x]) >= 3*255:
            return x
    return -1

# centers all images according to offset, thresholded by 3*255 to be considered part of digit
def center(img):
    # center vertically
    top = offset(img, 0, False, 0)
    bot = offset(img, 0, True, 0)
    newtop = (top + bot)/2
    img = numpy.roll(img, newtop-top, axis=0)
    
    # center horizontally
    left = offset(img, 0, False, 1)
    right = offset(img, 0, True, 1)
    newleft = (left + right)/2
    img = numpy.roll(img, newleft-left, axis=1)
    
    return img


# Server stuff
PORT = 6969


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write("<html><body><h1>hi!</h1></body></html>")

    def do_POST(self):

        print "incoming http:", self.path

	content_length = int(self.headers['Content-Length'])
	post_data = self.rfile.read(content_length)

        body = json.loads(post_data)
        base64_image_data = body["data"]
        rgba_arr = base64ToNumpyArray(base64_image_data)

        # run simple tranforms to prep for input
        grayscale_arr = numpy.invert(grayscale(rgba_arr))
	downsampled_arr = downsample(grayscale_arr)
        centered_arr = center(downsampled_arr)

        misc.toimage(centered_arr).show()

	prediction = process_2Darr(centered_arr)
	print "prediction:", prediction

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(prediction)


def run(port=6969):
    server_address = ("", port)
    httpd = HTTPServer(server_address, Handler)
    print "running server"
    httpd.serve_forever()

run(PORT)
