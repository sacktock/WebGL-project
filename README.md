# WebGL_project
L2 SM Computer Graphics Summative Assignment 2019/20. Implement a small 3D living room environment.

# What the project consists of
- the **lib** folder contains all the relevant WebGL libraries used in this project.
- the **resources** folder contains all the images used as textures in this project.
- **canvas.html** displays the WebGL canvas along with some instructions (also loads images into the DOM). 
- **run.bat** is a windows script to open the project into chrome using the parameter -allow-file-access-from-files.
- **script.js** is the main project code.
- **style.css** is a stylesheet file.

# How to run the webgl program
- double click the **canvas.html** file to open into your defualt browser (preferably one with WebGL support).
- if you get this error, __'The image element contains cross-origin data, and may not be loaded.'__, follow on to the next section.

# Loading textures securely
## Start http-server
- install **node**.
- install **http-server** globally with **npm**.
- open cmd.
- navigate to this directory.
- type the command __'http-sever'__.
- open your desired browser.
- go to __localhost:8080/canvas.html__.

https://jasonwatmore.com/post/2016/06/22/nodejs-setup-simple-http-server-local-web-server

## Run the .bat file (recommended easier option)
- alternatively, double click on the run.bat file.
- this should launch this project into chrome with the parameter __-allow-file-access-from-files__.
- **note:** provided __'chrome.exe'__ is in the folder __'C:\Program Files (x86)\Google\Chrome\Application\'__.

# Additional Info
## Controls
Use the arrow buttons to move the virtual camera, {LEFT_ARROW} and {RIGHT_ARROW} rotate the model matrix, {UP_ARROW} and {DOWN_ARROW} translate the model matrix in the z axis.

## Animations
- Use {Q} and {W} to open and close the cabinet drawer (the cabinet with the TV on top).
- Use {A} and {S} to tuck the chairs in and out from under the table.
- Use {Z} and {X} to move the arm chair back and forth.
- Use {O} and {P} to open and close the cupboard drawers.

## Lighting Effects
Press {SPACEBAR} to toggle the TV light on and off.