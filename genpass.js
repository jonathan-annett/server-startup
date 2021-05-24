const ALPHAS= "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(''),
      alphas= "abcdefghijklmnopqrstuvwxyz".split(''),
      numerics = "0123456789".split(''),
      symbols = "!@#$^&*()_-.<>,[]{}|".split(''),
      crypto = require('crypto');


function BigUint64Array_fromBuffer (buf) {
  const length = buf.length >> 3;
  const elements = new BigUint64Array(length);
  for (let i = 0;i<length;i++) {
    elements[i]= buf.readBigUInt64BE(i*8);
  }
  return elements;
}

function randomBigUint64Array(length,cb) {
      crypto.randomBytes(array.length * 8, function (err, buf) {
            if (err) return cb(err);
            cb(undefined,BigUint64Array_fromBuffer(buf));
      });
}

function randomBigUint64ArraySync(length) {
      const buf = Buffer.alloc(length * 8);
      crypto.randomFillSync(buf);
      return BigUint64Array_fromBuffer(buf);
}


function NumberArray_fromBuffer (buf) {
  const length = buf.length >> 3;
  const elements = new Array(length);
  for (let i = 0;i<length;i++) {
    elements[i]= Number(buf.readBigUInt64BE(i*8) );
  }
  return elements;
}


function randomNumberArray(length,cb) {
      crypto.randomBytes(length * 8, function (err, buf) {
            if (err) return cb(err);
            cb(undefined,NumberArray_fromBuffer(buf));
      });
}

function randomNumberArraySync(length) {
      const buf = Buffer.alloc(length * 8);
      crypto.randomFillSync(buf);
      return NumberArray_fromBuffer(buf);
}


function shuffleArray (array,cb) {
    randomNumberArray(array.length,function(err,nums) {  
       if (err) return cb(err);
       const matrix = nums.map(function (r,index){
          return {
              x : array[index],
              r : r 
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
    const nums = randomNumberArraySync(array.length);
    const matrix = nums.map(function (r,index){
    return {
              x : array[index],
              r : r 
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
   crypto.randomBytes(8, function (err, buf) {
      if (err) return cb(err);
      const r = Number(buf.readBigUInt64BE(0)) % range;
      cb (undefined, min + r);    
   });   
}

function randSync (min,max) {
   const range = max-min;
   const buf = Buffer.alloc(8);
   crypto.randomFillSync(buf);    
   const r = Number(buf.readBigUInt64BE(0)) % range;
   return min + r;
}

function choose(src,cb) {
    rand(0,src.length,function(err,ix) {
        if (err) return cb (err); 
        cb( src [ix] );
    });
}


function chooseSync(src) {
    const ix = randSync(0,src.length);
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
  rand(min,max,function(err,len){
                         
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
      i++;
  }
  // pass the shuffled array back to caller    
  return  shuffleArraySync (chars).join('');
}


function chooseSecurePW(max,cb) {
   choosePW (true,true,true,true,Math.ceil((max/4)*3),max,cb);
}


function chooseSecurePWSync(max) {
   return choosePWSync (true,true,true,true,Math.ceil((max/4)*3),max);
}


 function auxPasswords(pwCount) {
      pwCount = pwCount||4;
      const passwd = function(){return chooseSecurePWSync(64);}; 
      const nonce = function(){return randSync(0,Number.MAX_SAFE_INTEGER);}; 


  // start off with 4 x "nonces" that are not unique, to force at least 1 loop iteration
      const aux = { nonce1 : 1, nonce2 : 1, nonce3 : 1, nonce4 : 1};

      // generate some general purpose random passwords and nonces for use by the server
      while (
          [aux.nonce1,aux.nonce2,aux.nonce3].indexOf(aux.nonce4)>=0 ||
          [aux.nonce1,aux.nonce2,aux.nonce4].indexOf(aux.nonce3)>=0 ||
          [aux.nonce1,aux.nonce3,aux.nonce4].indexOf(aux.nonce2)>=0 ||
          [aux.nonce2,aux.nonce3,aux.nonce4].indexOf(aux.nonce1)>=0
      ) {
          // this loop will iterate at least once, until each nonce is unique.
          // this will deliberately burns through entropy in the unlikely event a nonce is repeated. 
         for (let i = 1; i <= pwCount; i ++ ) {
           aux["pass"+i]=passwd();   
         }
         aux.nonce1 = nonce();
         aux.nonce2 = nonce();
         aux.nonce3 = nonce();
         aux.nonce4 = nonce();
      };   

    return aux;
}

module.exports = {};
module.exports.chooseSecurePW = chooseSecurePW;
module.exports.choosePW = choosePW;
module.exports.rand = rand;
module.exports.shuffleArray = shuffleArray;

module.exports.chooseSecurePWSync = chooseSecurePWSync;
module.exports.choosePWSync = choosePWSync;
module.exports.rand = randSync;
module.exports.shuffleArraySync = shuffleArraySync;
module.exports.auxPasswords = auxPasswords;

