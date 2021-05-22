const fs = require("fs");
const path = require("path");
const config_path = path.dirname(process.mainModule.filename);
const config_filename = path.join(config_path,"keys.json");
const script_base = 'keys.js';
const script_file = path.join(config_path,script_base);
   
function makeKeysFile(){
   
   fs.writeFileSync(
     script_file,
     fs.readFileSync(
        path.join(__dirname,script_base),
     )
   ) ;
   
  fs.chmodSync(script_file, 0755);
   
  console.log('try:');
  console.log('$ cd',config_path);
  console.log('$ sudo '+script_file+' some.domain.name '+config_filename);
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


if (fs.existsSync(config_filename)) {
  
  npmCheck();

  const https = require("https");
  try {
    
    const secureJSON = require("glitch-secure-json");

    const config = secureJSON.parse(fs.readFileSync(config_filename));

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
