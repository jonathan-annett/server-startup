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

function choose(src,cb) {

    crypto.randomBytes(src.length, (err, buf) => {
      if (err) throw err;
      let ix;
      for (let i = 0;i<buf.length;i++) {
        if (ix===undefined ||i < ix) {
          ix = i;
        }
      }
      cb( src [ix] );
    });

}

function choosePW (up,low,num,sym,min,max,cb){
  
  const srcs = [];
  if (up) srcs.push(ALPHAS);
  if (low) srcs.push(alphas);
  if (num) srcs.push(numerics);
  if (sym) srcs.push(symbols);
  
  const chars = [];
  crypto.randomBytes(3, (err, buf) {
     if (err) return cb(err);
     const len = min + ( (buf[0] + buf[1] << 8 + buf[2] << 16) % (max-min)); 
     const next = function (i) {
       if (next >= srcs.length) {
         i = 0;
       }
       choose(srcs[i],function(r) {
          chars.push(r); 
          if (chars.length >= len) {
              return shuffleArray (chars,function(err,shuffled){
                 if (err) return cb(err);
                 cb(undefined,shuffled.join(''));
              });
          } else {
             return next(i+1);
          }
       });
     };
     next (0);
  });
 
}

function chooseSecurePw(max,cb) {
   choosePW (true,true,true,true,Math.ceil((max/4)*3),max,cb);
}

module.exports = chooseSecurePw;
module.exports.choosePW = choosePW;
