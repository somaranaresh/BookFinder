# BookFinder

Requirements
This application requires installation of NodeJS, MongoDB and RedisDb prior to running.

Description

This application was created for search books, also it sugges most popular searched books.

Installation
Install all dependencies in package.json file. This can be done by navigating to the root directory in the command prompt/terminal/console (I will refer to it as command prompt) and running the following command:
$ npm install

Add MongoDb, RedisDb server information in config file 

$ npm start

In local severs by default server can be accessed by given link -  http://localhost:3100/.

------------------------------------------------------------------------------------------------------------------------------
This is to explain how the project is structured and what all components are used to build and the design choices made

server.js - It is main file to start server.

Config/default.json - Used to read configuration like server port,mongodb connection url etc.

Images - Used to store book cover images and this will be optimized later to store thumbnails of smaller size

lib/BookFinderLib.js - used for some common function which used across project

lib/logger.js - Used for log management

lib/MongoConnections.js - Used for mongo db connectivity 

logs - Contain log files
routes/Books.js - Contain Books api (i.e - save books, get books, search books);
routes/login.js - Contain Login api
routes/Users.js - Contain User api (i.e - save user)
