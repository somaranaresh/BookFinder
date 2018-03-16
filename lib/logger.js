/**
 * Created by nareshs on 3/15/2018.
 */
var fs = require('fs');
var winston = require('winston');
var config = require('config');
var path    =  require('path');
var logDirectory = path.join(__dirname, '../logs');
var dt = require('datetimejs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level:            'info',
      filename:         logDirectory + '/'+config.logger.log_file_name,
      handleExceptions: true,
      json:             false,
      maxsize:          config.logger.log_file_maxsize, //100MB
      timestamp: function () {
        var date = new Date();
        var temp = dt.strftime(date, '%Y/%m/%d %H:%M:%S');
        return temp;
      },
      colorize:         false
    })  
  ], 
  exitOnError: false 
});

logger.stream = { 
  write: function(message, encoding){ 
    logger.info(message); 
  } 
};

module.exports = logger;
