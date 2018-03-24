/**
 * Created by nareshs on 3/15/2018.
 */
var express = require('express');
var router = express.Router();
router.route('/').post(function(req, res, next){
    var isInvalid = bookFinderLib.mandatoryParametersMissing(req.body, ['username','name','password','role']);
    if(isInvalid){
        logger.info(`At User : Save - required parameter missing ${isInvalid}`);
        return res.render('register', {
            message : 'Mandatory parameter missing'
        });
    }
    mongo.Users.findOne({username : req.body.username}, {}, function (mongoErr, mongoRes) {
        logger.info(`At Login : Users - check user is valid err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
        if(mongoRes){
            return res.render('register', {
                message : 'Username already exists'
            });
        }
        mongo.Users.insert({username : req.body.username, name : req.body.name, role : req.body.role, password : req.body.password}, function (mongoErr, mongoRes) {
            logger.info(`At Login : Users - insert user err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
            if(mongoRes){
                return res.redirect('/login');
            }
            return res.render('register', {
                message : 'Internal server error'
            });
        });
    });
});

module.exports = router;
