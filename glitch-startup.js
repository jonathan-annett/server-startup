const http = require('http'); 

module.exports = function(appFactory,express) {
  
  const self = {
     server        : http.createServer(function(req,res){
                       return self.app(req,res);
                     }),
     https_server  : false,
  };
  
  const implementation = { 
    
     app : {
       value : appFactory(express,self.server),
       enumerable : true,
       writable   : false
     },
    
     http_server : {
        get : function () {
           return self.server; 
        }
     },
    
     https_server : {
         value      : null,
         enumerable : true,
         writable   : false
     },
    
     glitch : {
         value      : true,
         enumerable : true,
         writable   : false
     },
    
    
  };
      
  const listener = self.server.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
  });
  
  Object.defineProperties(self, implementation);
  return self;
};
