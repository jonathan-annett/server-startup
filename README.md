# server-startup

a wrapper module that assists you to migrate an app to and from glitch.

takes into account that a glitch uses http, but your standalone app should be https.

this module basically allows a common interface.



`package.json`

```json
{
  "name": "simple-example",
  "version": "0.0.1",
  "description": "a node js app that runs either on glitch, or standalone using ssl certs",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "express-ws": "^4.0.0",
    "server-startup": "github:jonathan-annett/server-startup#19b1bff5f71f2543554f078ce28220ce204b3ba4",
  },
  "engines": {
    "node": "12.x"
  },
  "license": "MIT",
}
```


`server.js`

```js
require("server-startup")(require("./server/app"));
```

`server/app.js` 

```js

/*

this module an "app factory" function that returns the app that will later get passed into server.listen()

we pass in server here which you can ignore completely, or if working with websockets, pass it in to express-ws so it can set up
the upgrade process correctly.

before creating the app, and... there's a chicken or egg situation where the server is expecting the app listener function in it's
constructor. 

this module takes care of that by providing a wrapper which forward declares your app, so the server can exist
at the time you are creating the app itself.


*/

module.exports = function (express,server) {

  const app = express();  

  app.use(express.static("/app/public"));  
  
  app.use(require("express-ws")(app,server));
  
  app.get ("/",function(req,res) {
     res.sendFile('/app/public/index.html');
  });
  
  app.ws('/mysocket',function(ws,req) {
     ws.on('message',function(message) {
        console.log("socket says:",message);
     )};
     
     ws.send("hello mr socket");
  });

  return app;
}  
```

`public/index.html`

```html

<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Websocket tester</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    </head>  
  <body>
    <h1>Hi there!</h1>
    
   <script>
   const url = 'wss://'+location.hostname+'/mysocket';
    
    const connection = new WebSocket(url)

    connection.onopen = () => {
      connection.send('hey') 
    }

  connection.onerror = (error) => {
    console.log(`WebSocket error: ${error}`)
  }

  connection.onmessage = (e) => {
    console.log(e.data)
  }
   
   </script>
 
  </body>
</html>

```



the first time you run off glitch you need to 

   * have created your certs using the lets encrypt certbot (it will have put them in `/etc/letsencrypt/live/whatever.your.domain.is.com`)
   * downloaded and unzipped the zip from your glitch repo to a folder called /app
   * created an empty file called .env in /app
   * run `node ./server.js` once - this will create a keys.js file
   * run `sudo ./keys.js whatever.your.domain.is.com ./keys.json`
   * you might need to run the last command twice
   
keys.js basically reads the certs and securely writes them to keys.json (.env holds a private key to the json file)
keys.js also runs setcap on your node executable to allow it to open ports 80 and 443, for http and https access, which is the main reason you need sudo access, besides getting access to your certs.

from then on, node does not need sudo access.
