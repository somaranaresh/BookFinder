/**
 * Created by nareshs on 3/15/2018.
 */
var express = require('express');
var router = express.Router();
router.route('/').post(function(req, res, next){
    var isInvalid = bookFinderLib.mandatoryParametersMissing(req.body, ['title','author','isbn','genre']);
    if(isInvalid || (req.body.hasCove == 'true' &&!req.files)){
        logger.info(`At Books : Save - required parameter missing ${isInvalid}`);
        return res.render('book', {
            username : req.body.username,
            role : req.body.role,
            message : 'Mandatory parameters missing'
        });
    }
    if(req.body.hasCove == 'false' || (req.files.cover.name.endsWith('.png') || req.files.cover.name.endsWith('.jpg'))){

        mongo.Books.findOne({isbn : req.body.isbn}, {}, function (mongoErr, mongoRes) {
            logger.info(`At Login : Users - check user is valid err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
            if(mongoRes){
                return res.render('book', {
                    username : req.body.username,
                    role : req.body.role,
                    message : 'isbn already exists'
                });
            }
            mongo.Books.insert({title : req.body.title, author : req.body.author, isbn : req.body.isbn, genre : req.body.genre, hasCover : req.body.hasCover}, function (mongoErr, mongoRes) {
                logger.info(`At Login : Users - insert user err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
                if(mongoRes){
                    if(req.files.hasOwnProperty('cover')){
                        req.files.cover.mv('./images/'+req.body.isbn+'.jpg', function(fileUploadErr){
                            if(fileUploadErr){
                                logger.error(err.stack);
                                return res.render('book', {
                                    username : req.body.username,
                                    role : req.body.role,
                                    message : 'Internal server error'
                                });
                            }
                            return res.redirect('/books');
                        });
                    }else{
                        return res.redirect('/books');
                    }
                }else{
                    return res.render('book', {
                        username : req.body.username,
                        role : req.body.role,
                        message : 'Internal server error'
                    });
                }
            });
        });
    }
    else{
        return res.render('book', {
            username : req.body.username,
            role : req.body.role,
            message : 'Invalid file format'
        });
    }
})
    .get(function(req, res, next){
        redis.get('mostSearchedBooks', function (redisErr, redisRes) {
            logger.info(`At Books : getBooks - mostSearchedBooks err : ${redisErr}, res : ${redisRes}`);
            if(redisRes){
                return res.render('books', {
                    message : 'Popular results',
                    books: JSON.parse(redisRes)
                });
            }else{
                mongo.Books.find({}).limit(100).toArray(function (mongoErr, mongoRes) {
                    logger.info(`At Books : getBooks - mongo err : ${mongoErr} res : ${util.format('%j', mongoRes)}`);
                    if(mongoRes.length > 0){
                        return res.render('books', {
                            message : 'Popular results',
                            books: mongoRes
                        });
                    }
                });
            }
        });
    });

router.post('/search', function(req, res, next) {
    if(req.body.search){
        mongo.Books.find( { $text: { $search: req.body.search } }, { score: { $meta: "textScore" } }).sort( { score: { $meta: "textScore" } } ).toArray(function (mongoErr, mongoRes) {
            logger.info(`At Books : Books - search string : ${req.body.search}, err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
            if(mongoRes.length > 0){
                var latestBooks = [];
                latestBooks.push('popularBooks');
                for(let i = 0; i < mongoRes.length && i < 5; i++){
                    latestBooks.push(1);
                    latestBooks.push(mongoRes[i].isbn);
                }
                bookFinderLib.updateTopBooksRedis(latestBooks);
                return res.render('books', {
                    message : 'Search results',
                    books: mongoRes
                });
            }
        })
    } else{
        return res.redirect('/books');
    }
});

router.get('/addBook', function (req, res, next) {
    return res.render('book', {
        message : 'Add book'
    });
})

module.exports = router;
