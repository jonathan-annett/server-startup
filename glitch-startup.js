const http = require('http'); 


function customHttpHandler(express,port,uri,handler,message) {
    
    const http_app = express();

    http_app.get(uri, handler);

    const http_listener = http_app.listen(port, function() {
       if (message) 
          console.log(message);
    });

    http_listener.on('error',function(e){
        console.log(e);
    });
    
    return http_app;
      
}



module.exports = function(appFactory,express) {
  
  const self = {
     server        : http.createServer(function(req,res){
                       return self.app(req,res);
                     }),
    
     customHttpHandler : customHttpHandler,
  };
  
  const implementation = { 
    
     app : {
       value : appFactory(express,self.server),
       enumerable : true,
       writable   : false
     },
    
    
     http_app : {
        get : function () {
           return self.app; 
        },
        enumerable : true,
        writable   : false       
     },
     http_server : {
        get : function () {
           return self.server; 
        },
        enumerable : true,
        writable   : false
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
  
  Object.defineProperties(self, implementation);
      
  const listener = self.server.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
  });
  
  return self;
};
