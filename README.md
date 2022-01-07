<!-- Title and Description -->
# ImageSharingSite #
This website is an image sharing website built using HTML and Javascript. It is designed to run using a node.js server and communicates with an SQL database to store user credentials and information associated with an individual profile.

Unregistered users will have view-only access. This will allow visitors to view the portfolio of images upload to the website, how many likes an image has, and additional information associated with the image upload. The website provides a sign-up flow which will allow users to register a new profile. Upon doing so, users will have their own profile where they can upload images, leave likes on images and comments. 

# Installation Guide

## Prerequisite ##

In order to run the Image Sharing Site on your local machine, you must first have node.js installed. To install node.js, please follow the instruction guide outlined by the official documentation at [nodejs.org](https://nodejs.org/en/download/ "nodejs.org").

## Download and run ##

To download the project, please select the 'Download Zip' option found under the green 'Code' dropdown menu. Once the zip file is download, extract the project in your desired location. To begin running the project on your local server, open up a new command line and navigate to the project directory. Ensure that you are inside the directory that includes the index.js file. Example:
  C:\Users\Projects\ImageSharingSite-main
  
Finally, the run command can be performed by inputting the following:
  node index.js
  
This will start the server on port 8000 which can be visited at [http://localhost:8000/](http://localhost:8000/ "localhost").
