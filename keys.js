#!/usr/bin/env node

(function(){
    
if (!process.mainModule || process.mainModule.filename !==__filename) {
   console.warn(__filename,"invoked via require",process.mainModule);
} else {
    const secureJSON=require('glitch-secure-json');
    const { auxPasswords } = require('./genpass.js');
    const fs=require('fs');
    const path=require('path');
    const execSync = require('child_process').execSync;
    const domain = process.argv[2];
    console.log('domain:',domain);
    if (domain && typeof domain==='string'&& domain.length>0) {
        
        const live_path = path.join('/etc/letsencrypt/live',domain); 
        console.log('live_path:',live_path);
        if ( domain && 
             fs.existsSync(live_path) && 
             fs.statSync(live_path).isDirectory() 
           ) {
               
            // load in each cert file from the secure storage directory
            // (this process runs as root, so we have permission)
            const key_path = path.join('/etc/letsencrypt/live',domain,'privkey.pem');
            const cert_path = path.join('/etc/letsencrypt/live',domain,'cert.pem');
            const ca_path = path.join('/etc/letsencrypt/live',domain,'chain.pem');
            
            const certs = {
                key:fs.readFileSync(key_path,'utf8'),
                cert:fs.readFileSync(cert_path,'utf8'),
                ca:fs.readFileSync(ca_path,'utf8'),
            };
            
            const aux = auxPasswords();
            
            // package up the domain, certs and aux password/nonces into a single secure json payload 
            const json = secureJSON.stringify({domain:domain,certs:certs,aux:aux});
            
            // and either dump it to the console or to a file, depending on the arguments passed in.
            const store_path = process.argv[3];
            if (store_path && store_path.length > 0) {
              fs.writeFileSync(store_path,json);
              console.log('write to ',store_path);
            }  else {
               console.log(json);
            }
            
            // finally, since we are running as root, if getcap/setcap is installed, use it to allow node to open low ports 
            if ( fs.existsSync(execSync('which setcap',{ encoding: 'utf8' }).toString()) && 
                 fs.existsSync(execSync('which getcap',{ encoding: 'utf8' }).toString()) 
               ) {
        
                if ( execSync('getcap '+process.execPath,{ encoding: 'utf8' }).toString().indexOf('cap_net_bind_service+ep')<0) {
                      console.log("running setcap to allow",process.execPath," to open low ports (http,https)"); 
                      execSync('setcap cap_net_bind_service=+ep '+process.execPath,{stdio: 'inherit'});
                }
                
            }
            return;
        }
    }
    
    console.log('usage: sudo node',path.basename(__filename),'some.domain.name /path/to/keys.json');
}
})();
