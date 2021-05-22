module.exports = function(app,express) {
  const listener = app.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
  });
  const self = {};
  const implementation = {
  };
  Object.defineProperties(self, implementation);
  return self;
};
