const ALPHAS= "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(),
      alphas= "abcdefghijklmnopqrstuvwxyz".split(),
      numerics = "0123456789".split(),
      symbols = "!@#$%^&*()_/?.<>,[]{}|\\".split(),
      crypto = require('crypto');


function shuffleArray (array,cb) {
    crypto.randomBytes(array.length * 4, function (err, buf) {
       if (err) return cb(err);
       const matrix = array.map(function (x,index){
          const ix = index*4,ix_end = ix+4,
          const rand = buf.slice(ix,ix_end);
          return {
              x : x,
              r : rand[0] + (rand[1] <<8) + (rand[2] <<16)+ (rand[3] <<24) 
          };
       });
       matrix.sort(function(a,b) {
         return a.r - b.r; 
       });
       cb( undefined,matrix.map (function (el,index) {
         array [index] = el.x;
         return el.x;
       }) );
    }); 
 }

function shuffleArraySync (array) {
    const buf = Buffer.alloc(array.length * 4);
    crypto.randomFillSync(buf);
    const matrix = array.map(function (x,index){
            const ix = index*4,ix_end = ix+4,
            const rand = buf.slice(ix,ix_end);
            return {
              x : x,
              r : rand[0] + (rand[1] <<8) + (rand[2] <<16)+ (rand[3] <<24) 
            };
     });
     matrix.sort(function(a,b) {
       return a.r - b.r; 
     });  
     return matrix.map (function (el,index) {
       array [index] = el.x;
       return el.x;
     });
}

function rand (min,max,cb) {
   const range = max-min;
   // determine how many bytes of entropy we need 
   let bytes = 1;
   while ( (1 << (bytes*8)) <= range) {
      bytes++;
   }
   // generate that many bytes of entropy
   crypto.randomBytes(bytes, (err, buf) {
     if (err) return cb(err);
      // shift the bits into a large integer called r
      let r = buf [--bytes];
      while (bytes>0) {
         r <<= 8;
         r +=buf[--bytes];
      }
      //constrain the result to the specific range using modulus, and add to minimuum
      cb (undefined, min + (r % range)); 
   });
}

function randSync (min,max) {
   const range = max-min;
   // determine how many bytes of entropy we need 
   let bytes = 1;
   while ( (1 << (bytes*8)) <= range) {
      bytes++;
   }
   // generate that many bytes of entropy
  const buf = Buffer.alloc(bytes);
  crypto.randomFillSync(buf);      
  // shift the bits into a large integer called r
  let r = buf [--bytes];
  while (bytes>0) {
      r <<= 8;
      r +=buf[--bytes];
  }
  //constrain the result to the specific range using modulus, and add to minimuum
  return  min + (r % range); 
}

function choose(src,cb) {
    rand(0,src.length,function(err,ix) {
        if (err) return cb (err); 
        cb( src [ix] );
    });
}


function chooseSync(src) {
    const ix = randSync(src.length);
    return src [ix];
}

function choosePW (up,low,num,sym,min,max,cb){
  
  // assemble an array of candidate sources for the allowable characters in the password    
  const srcs = [];
  if (up) srcs.push(ALPHAS);
  if (low) srcs.push(alphas);
  if (num) srcs.push(numerics);
  if (sym) srcs.push(symbols);
  
  if (srcs.length===0) {
    return cb (new Error("need at least 1 character type"));        
  }
      
  //define a holding array for the characters that make up the password (unshuffled)
  const chars = [];
      
  // choose a random length as per the specifications passed in    
  rand(min,max,function(err,len{
                         
    // round robin allocate a character at roundom from each source type until we have
    // our target length. (this will be an array of characters that need to be shuffled) 
    const next = function (i) {
       if (i >= srcs.length) {
         i = 0;
       }
       choose(srcs[i],function(r) {
          chars.push(r); 
          if (chars.length >= len) {
              // the end condition has been meet (we have len chars ready to shuffle)
              return shuffleArray (chars,function(err,shuffled){
                 if (err) return cb(err);
                 // pass the shuffled array back to caller
                 return cb(undefined,shuffled.join(''));
              });
          } else {
             // choose a char from the next source array
             return next(i+1);
          }
       });
     };
     // start our async loop, at src[] element 0
     next (0);
  });
}

function choosePWSync (up,low,num,sym,min,max){
   
   // assemble an array of candidate sources for the allowable characters in the password    

  const srcs = [];
  if (up) srcs.push(ALPHAS);
  if (low) srcs.push(alphas);
  if (num) srcs.push(numerics);
  if (sym) srcs.push(symbols);
  
  //define a holding array for the characters that make up the password (unshuffled)
  const chars = [];
      
  // choose a random length as per the specifications passed in    
  let i=0,len = randSync(min,max);
      
      
  // round robin allocate a character at roundom from each source type until we have
  // our target length. (this will be an array of characters that need to be shuffled) 
  for (let c=0; c<len ; c++) {     
      if (i >= srcs.length) {
         i = 0;
       }
      chars.push( chooseSync(srcs[i]) ); 
      i++:
  }
  // pass the shuffled array back to caller    
  return  shuffleArraySync (chars);
}


function chooseSecurePw(max,cb) {
   choosePW (true,true,true,true,Math.ceil((max/4)*3),max,cb);
}


function chooseSecurePwSync(max,cb) {
   return choosePWSync (true,true,true,true,Math.ceil((max/4)*3),max);
}

module.exports = {};
module.exports.chooseSecurePw = chooseSecurePw;
module.exports.choosePW = choosePW;
module.exports.rand = rand;
module.exports.shuffleArray = shuffleArray;

module.exports.chooseSecurePwSync = chooseSecurePwSync;
module.exports.choosePWSync = choosePWSync;
module.exports.rand = randSync;
module.exports.shuffleArraySync = shuffleArraySync;

