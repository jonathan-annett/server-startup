const http = require('http'); 

module.exports = function(app,express) {
  
 const glitchProxiedServer = http.createServer(app);

  if (typeof app.__on_server==='function') {
    app.__on_server(glitchProxiedServer);
  }
      
  const listener = glitchProxiedServer.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
     if (typeof app.__on_listener==='function') {
       app.__on_listener(listener);
     }

  });
  
  
  const self = {
     http_server   : glitchProxiedServer,
     http_listener : listener
  };
  const implementation = { };
  Object.defineProperties(self, implementation);
  return self;
};
