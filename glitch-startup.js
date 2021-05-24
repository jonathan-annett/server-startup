module.exports = function(app,express) {
  
  if (typeof app.__on_server==='function') {
    app.__on_server();
  }

  const listener = app.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
     if (typeof app.__on_server==='function') {
       app.__on_server(undefined,listener);
     }

  });
  
  
  const self = {};
  const implementation = { };
  Object.defineProperties(self, implementation);
  return self;
};
