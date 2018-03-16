/**
 * Created by nareshs on 3/15/2018.
 */
var mongoClient = require('mongodb').MongoClient;
var logger      = require('./logger');

/*
* @{
* @url : mongo connection url,
* @collections : ['<collection name to connect>']
* }*/
class MongoConnections{
    constructor(data){
        this.url = data.url;
        this.collections = data.collections || [];
        this.retryCount = 0;
    }

    connectToDB(callback){// {reconnectTries: 60, reconnectInterval: 1000},
        mongoClient.connect(this.url, (err, db) => {
            try{
                logger.info(`At C:MongoConnections, M:connectToMongo - err : ${err}, db : ${db}`);
                if(db){
                    this.db = db;
                    this.connectToCollections(callback);
                }else {
                    if(this.retryCount == 10){
                        callback(err);
                    }
                    this.connectToDB(callback);
                }
            }catch (err){
                logger.error(err.stack);
            }
        });
    }
    connectToCollections(callback){
        try{
            var collectionsCount = this.collections.length;
            for(let i = 0; i < collectionsCount; i++){
                this.db.collection(this.collections[i], (err, collection) => {
                    try{
                        logger.info(`At C:MongoConnections, M:connectToCollections - collection : ${this.collections[i]} err : ${err}`);
                        if(collection){
                            this[this.collections[i]] = collection;
                        }
                       
                        if(i == (collectionsCount-1)){
                            callback('Connected to mongo DB');
                        }
                    }catch (err){
                        logger.error(err.stack);
                    }
                });
            }

        }catch (err){
            logger.error(err.stack);
        }
    }
}
module.exports = MongoConnections;