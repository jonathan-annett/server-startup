#!/usr/bin/env node

(function(){
    
if (!process.mainModule || process.mainModule.filename !==__filename) {
   console.warn(__filename,"invoked via require",process.mainModule);
} else {
    const secureJSON=require('glitch-secure-json');
    const fs=require('fs'),existsSync=fs.existsSync;
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
               
            const key_path = path.join('/etc/letsencrypt/live',domain,'privkey.pem');
            const cert_path = path.join('/etc/letsencrypt/live',domain,'cert.pem');
            const ca_path = path.join('/etc/letsencrypt/live',domain,'chain.pem');
            
            const certs = {
                key:fs.readFileSync(key_path,'utf8'),
                cert:fs.readFileSync(cert_path,'utf8'),
                ca:fs.readFileSync(ca_path,'utf8'),
            };
            
            const json = secureJSON.stringify({domain:domain,certs:certs});
            
            const store_path = process.argv[3];
            if (store_path && store_path.length > 0) {
              fs.writeFileSync(store_path,json);
              console.log('write to ',store_path);
            }  else {
               console.log(json);
            }
            
               'apt-get install libcap2-bin',{stdio: 'inherit'}
            }
        
            if ( execSync('getcap'+process.execPath,{ encoding: 'utf8' }).toString().indexOf('cap_net_bind_service+ep')<0) {
                  execSync('setcap cap_net_bind_service=+ep '+process.execPath,{stdio: 'inherit'});
            }
            return;
        }
    }
    
    console.log('usage: sudo node',path.basename(__filename),'some.domain.name /path/to/keys.json')
}
})();
