# WebGL_project
L2 SM Computer Graphics Summative Assignment 2019/20. Implement a small 3D living room environment.

# What the project consists of
- the lib folder contains all the relevant WebGL libraries used in this project.
- the resources folder contains all the images used as textures in this project.
- canvas.html displays the WebGl canvas along with some instructions (also loads images into the DOM). 
- run.bat is a windows script to open the project with chrome using the parameter -allow-file-access-from-files.
- script.js is the main project code.
- style.css is a stylesheet file.

# How to run the webgl program
- double click the canvas.html file to open into your defualt browser (preferably one with WebGl support).
- if you get this error, 'The image element contains cross-origin data, and may not be loaded.', follow on to the next section.

# Loading textures securely
## Start http-server
- install node.
- install http-server golbally with npm.
- open cmd.
- navigate to this directory.
- type the command 'http-sever'.
- open your desired browser.
- go to localhost:8080/canvas.html.

https://jasonwatmore.com/post/2016/06/22/nodejs-setup-simple-http-server-local-web-server

## Run the .bat file
- alternatively double click on the run.bat file.
- this should launch this project into chrome with the parameter -allow-file-access-from-files.
- **note:** provided "chrome.exe" is in the folder "C:\Program Files (x86)\Google\Chrome\Application\".

# Controls
Use the arrow buttons to move the virtual camera, {LEFT_ARROW} and {RIGHT_ARROW} rotate the model matrix, {UP_ARROW} and {DOWN_ARROW} translate the model matrix in the z axis.

# Animations
- Use {Q} and {W} to open and close the cabinet drawer (the cabinet with the TV on top).
- Use {A} and {S} to tuck the chairs in and out from under the table.
- Use {Z} and {X} to move the arm chair back and forth.
- Use {O} and {P} to open and close the cuboard drawers.

# Lighting Effects
Press {SPACEBAR} to toggle the TV light on and off.