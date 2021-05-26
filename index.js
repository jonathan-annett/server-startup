module.exports = function(appFactory) {  
    
   // detect where the app is running and use appropriate startup code
   const startup = require('glitch-detect') 
         ? require("./glitch-startup.js") 
         : require("./standalone-startup.js");
  
   process.servers = startup(appFactory, require("express"));
   return process.servers; 
}
