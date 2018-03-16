
This is to explain how the project is structured and what all components are used to build and the design choices made
server.js - It is main file to start server.
Config/default.json - Used to read configuration like server port,mongodb connection url etc.
Images - Used to store book cover images and this will be optimized later to store thumbnails of 
smaller size
lib/BookFinderLib.js - used for some common function which used across project
lib/logger.js - Used for log management
lib/MongoConnections.js - Used for mongo db connectivity 

logs - Contain log files
routes/Books.js - Contain Books api (i.e - save books, get books, search books);
routes/login.js - Contain Login api
routes/Users.js - Contain User api (i.e - save user)