const fs = require("fs");
const path = require("path");
const config_path = path.join(
  path.dirname(process.mainModule.filename),
  "keys.json"
);

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

if (fs.existsSync(config_path)) {
  
  const https = require("https");
  try {
    
    const secureJSON = require("glitch-secure-json");

    const config = secureJSON.parse(fs.readFileSync(config_path));

    module.exports = function(app,express){
      const http_app = express();

      http_app.get("*", function(req, res) {
        res.redirect("https://" + req.headers.host + req.url);
      });

      const http_listener = http_app.listen(80, function() {
        console.log("Listening..(80=http to https redirector)");
      });

      const http_stopper = serverStopper(http_listener);

      const https_listener = https
        .createServer(config.certs, app)
        .listen(443, function() {
          console.log("Listening...(443=SSL for", config.domain, ")");
        });

      const https_stopper = serverStopper(https_listener);

      const self = {};
      const implementation = {
        listeners: {
          value: {
            http: http_listener,
            https: https_listener
          },
          enumerable: true,
          writable: false
        },
        stop: {
          value: function(cb) {
            https_stopper(function() {
              http_stopper(function() {
                if (typeof cb === "function") {
                  cb();
                }
              });
            });
          },
          enumerable: true,
          writable: false
        },
        connections: {
          get: function() {
            return Array.prototype.slice.call(https_stopper.sockets, 0);
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

  } catch (e) {
    module.exports = function(app,express) {
      console.log("error reading keys file. you may need to re-generate keys");
    }

  }
  
} else {
  
  module.exports = function(app,express) {
    console.log("no keys file found. you need to generate keys first");
  }
  
}
