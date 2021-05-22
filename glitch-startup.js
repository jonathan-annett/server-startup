function serverStopper(server) {
  // incoporates ideas from https://dev.to/gajus/how-to-terminate-a-http-server-in-node-js-ofk
  const sockets = new Set();

  server.on("connection", function(socket) {
    sockets.add(socket);

    server.once("close", () => {
      sockets.delete(socket);
    });
  });

  stop.sockets = sockets;

  return stop;

  /**
   * Forcefully terminates HTTP server.
   */
  function stop(cb) {
    for (const socket of sockets) {
      socket.destroy();
      sockets.delete(socket);
    }
    server.close(function() {
      if (typeof cb === "function") {
        cb();
      }
    });
  }
}

module.exports = function(app,express) {
  const listener = app.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
  });
  const stopper = serverStopper(listener);
  const self = {};
  const implementation = {
    listeners: {
      value: {
        http: listener,
        https: listener
      },
      enumerable: true,
      writable: false
    },
    stop: {
      value: function(cb) {
        stopper(function() {
          if (typeof cb === "function") {
            cb();
          }
        });
      },
      enumerable: true,
      writable: false
    },
    connections: {
      get: function() {
        return Array.prototype.slice.call(stopper.sockets, 0);
      },
      set: function() {
        /*ignored*/
      },
      enumerable: true
    }
  };
  Object.defineProperties(self, implementation);
  return self;
};
