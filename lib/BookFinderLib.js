/**
 * Created by nareshs on 3/15/2018.
 */
exports.mandatoryParametersMissing = function(data, requireParameters){
    try{
        for(var i =0; i< requireParameters.length; i++){
            if(!data[requireParameters[i]]){
                return requireParameters[i];
            }
        }
        return false;
    }catch (err){
        logger.error(err.stack);
    }
};

exports.updateTopBooksRedis = function (books) {
    try{
        redis.zadd(books, function (zaddErr, zaddRes) {
            try{
                logger.info(`At BooFinderLib : updateTopBooksRedis - zadd err : ${zaddErr}, res : ${zaddRes}`);
                redis.zremrangebyrank(['popularBooks', 0, -5], function (zremErr, zremRes) {
                    try{
                        logger.info(`At BooFinderLib : updateTopBooksRedis - zremrangebyrank err : ${zremErr}, res : ${zremRes}`);
                    }catch (err){
                        logger.error(err.stack);
                    }
                });
            }catch (err){
                logger.error(err.stack);
            }
        })
    }catch (err){
        logger.error(err.stack);
    }
}