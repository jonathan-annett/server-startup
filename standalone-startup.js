const fs = require("fs");
const path = require("path");
const config_path = path.join(
  path.dirname(process.mainModule.filename),
  "keys.json"
);

function makeKeysFile(){
   fs.writeFileSync(
     path.join(config_path,'keys.js'),
     fs.readFileSync(
        path.join(__dirname,'keys.js'),
     )
   ) ;
  console.log('try:');
  console.log('   cd',config_path);
  console.log('    sudo node ./keys.js some.domain.name ./keys.json');
}


function npmCheck() {
  require('child_process').execSync(
      'npm install',
      {
        cwd: config_path,
        stdio: 'inherit'
      }
  );
}


if (fs.existsSync(config_path)) {
  
  npmCheck();

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

      const https_listener = https
        .createServer(config.certs, app)
        .listen(443, function() {
          console.log("Listening...(443=SSL for", config.domain, ")");
        });

       const self = {};
        const implementation = {
        };
        Object.defineProperties(self, implementation);
        return self;
    };

  } catch (e) {
    module.exports = function(app,express) {
      console.log("error reading keys file. you may need to re-generate keys");
      makeKeysFile();
    }

  }
  
} else {
  
  module.exports = function(app,express) {
    console.log("no keys file found. you need to generate keys first");
    makeKeysFile();
  }
  
}
