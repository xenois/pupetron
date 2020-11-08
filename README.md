# Pupetron
Digital puppetry for Blender

**( Work in progress )**

## Blender setup

Packages should be installed in Blender's python

1. Install [Socket.IO Server](https://python-socketio.readthedocs.io/en/latest/server.html) : `pip install python-socketio` 
2. Install [Eventlet](http://eventlet.net/) : `pip install eventlet` 
3. Download `blender-files/pupetron-blender-addon.py`
4. In Blender, go to `File` > `User Preferences...` > `Add-ons` > `Install from file..` and select the file
5. Enable the add-on by ticking the corresponding box

## Project setup

1. Install all project packages `npm i`
2. Build project `npm run build`
3. Run the Electron app `npm run start` 

## Running tests

1. `npm run test` . * *For running realtime tests, Blender needs to be open ,the addon installed and activated. Also one object in the scene has to be selected.*