(function(){
    
if (!process.mainModule || process.mainModule.filename !==__filename) {
   console.warn(__filename,"invoked via require",process.mainModule);
} else {
    const secureJSON=require('glitch-secure-json');
    const fs=require('fs');
    const path=require('path');
    const domain = process.argv[2];
    if (domain && typeof domain==='string'&& domain.length>0) {
        const live_path =path.join('/etc/letsencrypt/live',domain); 
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
            return;
        }
    }
    
    console.log('usage: sudo node',path.basename(__filename),'some.domain.name /path/to/keys.json')
}
})();
