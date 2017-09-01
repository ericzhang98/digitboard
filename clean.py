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
from scipy import misc
from cStringIO import StringIO

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
    misc.imsave(output, arr, format='png')
    img_data = output.getvalue() 
    base64_string = base64.b64encode(img_data)  
    return base64_string        

def base64ToNumpyArray(base64_string):          
    img_data = base64.b64decode(base64_string)  
    arr = misc.imread(StringIO(img_data))            
    return arr   

def imageToBase64(img): 
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
