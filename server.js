/**
 * Created by nareshs on 3/15/2018.
 */
const express       = require('express');
const path          = require('path');
const http          = require('http');
const app           = express();
const bodyParser    = require('body-parser');
const fileUpload    = require('express-fileupload');

var MongoConnections= require('./lib/MongoConnections');
global.config       = require('config');
global.util         = require('util');
global.mongo        = new MongoConnections({url : config.mongo.mongourl, collections : ['Users', 'Books']});
global.redis       = require('redis').createClient({'url':'redis://'+config.redis.ip+':'+config.redis.port});
global.logger       = require('./lib/logger');
global.loginUserData= {};
global.bookFinderLib = require('./lib/BookFinderLib');

redis.on('error', function (err) {
    logger.error('error event - ' + config.redis.ip + ':' + config.redis.port + ' - ' + err);
});
mongo.connectToDB((res) => {
    try {
        logger.info(`At Mongo db connection response - res : ${res}`);
        if(res == 'Connected to mongo DB' && mongo.db.system.indexes.find({'name':'titel', 'ns':'BookFinder.Books'}).count() == 0){
            mongo.Books.createIndex({title : 'text', author : 'text', genre : 'text', isbn : 'text'});
        }
    } catch (err) {
        logger.error(err.stack);
    }
});

var millisecondsTORun = 7 * 24 * 60 * 60 * 1000;/* 7 day *24 hours × 60 minutes × 60 seconds * 1000 milliseconds */
/*
* To update popular books searched every week
* */
setInterval(function () {
    redis.zrange(['popularBooks', 0 , -1], function (redisErr, redisRes) {
        try{
            logger.info(`At Server : get popular books err : ${redisErr}, res : ${util.format('%j',redisRes)}`);
            if(redisRes){
                mongo.Books.find({isbn : {$in : redisRes}}).toArray(function (mongoErr, mongoRes) {
                    try{
                        if(mongoRes.length > 0){
                            var data = util.format('%j', mongoRes);
                            logger.info(`At Server - get popular books mongo err : ${mongoErr}, res : ${data}`);
                            redis.set('mostSearchedBooks',data, function (setErr, setRes) {
                                try{
                                    logger.info(`At Server - mostSearchedBooks update to redis from mongo ${setErr}, res : ${util.format('%j', setRes)}`);
                                }catch (err){
                                    logger.error(err.stack);
                                }
                            });
                        }
                    }catch (err){
                        logger.error(err.stack);
                    }
                })
            }
        }catch (err){
            logger.error(err.stack);
        }
    })
}, millisecondsTORun);

var books = require('./routes/Books');
var users = require('./routes/Users');
var login = require('./routes/login');

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.static(path.join(__dirname, 'images')));

app.use('/', function(req, res, next){
    res.redirect('/login');
});
app.use('/register', function(req, res, next){
    return res.render('register', {
        message : ''
    });
});
app.use('/books', books);
app.use('/users', users);
app.use('/login', login);
app.get('/cover/:name', function (req, res, next) {

    var options = {
        root: __dirname + '/images/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });

});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
var server = http.createServer(app);

server.listen(config.port);
server.on('error', function (error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});
server.on('listening', function () {
    var address = server.address();
    var bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + address.port;
    logger.info('Listening on ' + bind);
});