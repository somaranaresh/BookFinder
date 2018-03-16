/**
 * Created by nareshs on 3/15/2018.
 */
var express = require('express');
var router = express.Router();
router.route('/').post(function(req, res, next){
    try{
        var isInvalid = bookFinderLib.mandatoryParametersMissing(req.body, ['username','password']);
        if(isInvalid){
            logger.info(`At User : Save - required parameter missing ${isInvalid}`);
            res.render('login', {
                message : 'Mandatory parameter missing'
            });
        }
        mongo.Users.findOne({username : req.body.username}, {}, function (mongoErr, mongoRes) {
            try{
                logger.info(`At Login : Users check user is valid err : ${mongoErr}, res : ${util.format('%j', mongoRes)}`);
                if(mongoRes){
                    loginUserData[mongoRes.username] = {name : mongoRes.name, role : mongoRes.role};
                    return res.redirect('/books');
                }
                return res.render('login', {
                    message : 'Please enter valid username'
                });
            }catch (err){
                logger.error(err.stack);
                return res.render('login', {
                    message : 'Internal server error'
                });
            }
        });

    }catch (err){
        logger.error(err.stack);
        return res.render('login', {
            message : 'Internal server error'
        });
    }
})

module.exports = router;
