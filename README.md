# WebGL_project
L2 SM Computer Graphics Summative Assignment 2019/20. Implement a small 3D living room environment.

# What the project consists of
- the **lib** folder contains all the relevant WebGL libraries used in this project.
- the **resources** folder contains all the images used as textures in this project.
- **canvas.html** displays the WebGL canvas along with some instructions (also loads images into the DOM). 
- **run.bat** is a windows script to open the project into chrome using the parameter _-allow-file-access-from-files_.
- **script.js** is the main project code.
- **style.css** is a stylesheet file.

# How to run the webgl program
- double click the **canvas.html** file to open into your defualt browser (preferably one with WebGL support).
- if you get this error, _'The image element contains cross-origin data, and may not be loaded.'_, follow on to the next section.

# Loading textures securely
## Start http-server
- install **node**.
- install **http-server** globally with **npm**.
- open cmd.
- navigate to this directory.
- type the command _'http-sever'_.
- open your desired browser.
- go to _localhost:8080/canvas.html_.

https://jasonwatmore.com/post/2016/06/22/nodejs-setup-simple-http-server-local-web-server

## Run the .bat file (recommended easier option)
- alternatively, double click on the run.bat file.
- this should launch this project into chrome with the parameter _-allow-file-access-from-files_.
- **note:** provided _'chrome.exe'_ is in the folder _'C:\Program Files (x86)\Google\Chrome\Application\'_.

# External Resources
No external resources were used to create this project, only the examples from the lectures and lecture slides were used to help create this project.

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