/**
 * Created by nareshs on 3/15/2018.
 */
var express = require('express');
var router = express.Router();
router.route('/').post(function(req, res, next){
    try{
        var isInvalid = bookFinderLib.mandatoryParametersMissing(req.body, ['title','author','isbn','genre']);
        if(isInvalid || !req.files){
            logger.info(`At Books : Save - required parameter missing ${isInvalid}`);
            return res.render('book', {
                username : req.body.username,
                role : req.body.role,
                message : 'Mandatory parameters missing'
            });
        }
        if(req.files.cover.name.endsWith('.png') || req.files.cover.name.endsWith('.jpg')){

            mongo.Books.findOne({isbn : req.body.isbn}, {}, function (mongoErr, mongoRes) {
                try{
                    logger.info(`At Login : Users - check user is valid err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
                    if(mongoRes){
                        return res.render('book', {
                            username : req.body.username,
                            role : req.body.role,
                            message : 'isbn already exists'
                        });
                    }
                    mongo.Users.insert({title : req.body.title, author : req.body.author, isbn : req.body.isbn, genre : req.body.genre}, function (mongoErr, mongoRes) {
                        try{
                            logger.info(`At Login : Users - insert user err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
                            if(mongoRes){
                                req.files.cover.mv('../images/'+req.body.isbn+'.png', function(fileUploadErr){
                                    try{
                                        if(fileUploadErr){
                                            logger.error(err.stack);
                                            return res.render('book', {
                                                username : req.body.username,
                                                role : req.body.role,
                                                message : 'Internal server error'
                                            });
                                        }
                                        return res.redirect('/books');
                                    }catch (err){
                                        logger.error(err.stack);
                                        return res.render('book', {
                                            username : req.body.username,
                                            role : req.body.role,
                                            message : 'Internal server error'
                                        });
                                    }
                                });
                            }
                            return res.render('book', {
                                username : req.body.username,
                                role : req.body.role,
                                message : 'Internal server error'
                            });
                        }catch (err){
                            logger.error(err.stack);
                            return res.render('book', {
                                username : req.body.username,
                                role : req.body.role,
                                message : 'Internal server error'
                            });
                        }
                    });
                }catch (err){
                    logger.error(err.stack);
                    return res.render('book', {
                        username : req.body.username,
                        role : req.body.role,
                        message : 'Internal server error'
                    });
                }
            });
        }
        else{
            return res.render('book', {
                username : req.body.username,
                role : req.body.role,
                message : 'Invalid file format'
            });
        }
    }catch (err){
        logger.error(err.stack);
        return res.render('book', {
            username : req.body.username,
            role : req.body.role,
            message : 'Internal server error'
        });
    }
})
    .get(function(req, res, next){
        try{
            redis.get('mostSearchedBooks', function (redisErr, redisRes) {
                try{
                    logger.info(`At Books : getBooks - mostSearchedBooks err : ${redisErr}, res : ${redisRes}`);
                    if(redisRes){
                        return res.render('books', {
                            message : 'Popular results',
                            books: JSON.parse(redisRes)
                        });
                    }else{
                        mongo.Books.find({}).limit(100).toArray(function (mongoErr, mongoRes) {
                            try{
                                logger.info(`At Books : getBooks - mongo err : ${mongoErr} res : ${util.format('%j', mongoRes)}`);
                                if(mongoRes.length > 0){
                                    return res.render('books', {
                                        message : 'Popular results',
                                        books: mongoRes
                                    });
                                }
                            }catch (err){
                                logger.error(err.stack);
                                return res.redirect('/books');
                            }
                        })
                    }
                }catch (err){
                    logger.error(err.stack);
                    return res.redirect('/books');
                }
            });
        }catch (err){
            logger.error(err.stack);
            return res.redirect('/books');
        }
    });

router.post('/search', function(req, res, next) {
    try{
        if(req.body.search){
            db.Books.find(
                { $text: { $search: searchString } },
                { score: { $meta: "textScore" } }
            ).sort( { score: { $meta: "textScore" } } ).toArray(function (mongoErr, mongoRes) {
                    try{
                        logger.info(`At Books : Books - search string : ${searchString}, err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
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
                    }catch (err){
                        logger.error(err.stack);
                        return res.redirect('/books');
                    }
                })
        } else{
            return res.redirect('/books');
        }
    }catch (err){
        logger.error(err.stack);
        return res.redirect('/books');
    }
});

module.exports = router;
