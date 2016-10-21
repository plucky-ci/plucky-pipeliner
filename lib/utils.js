const isNumeric = (n)=>{
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const allBut = (o, exclude)=>{
  return Object.keys(o).reduce((set, key)=>{
    if(exclude.indexOf(key)===-1){
      set[key] = o[key];
    }
    return set;
  }, {});
};

const getObjectValue = (key, obj, defaultValue)=>{
  let o = obj;
  let path = key.split('.');
  let segment;
  while(o && path.length){
    segment = path.shift();
    o = o[segment];
  }
  if(typeof(o) !== 'undefined'){
    return o;
  }
  return defaultValue;
};

module.exports = {
  isNumeric,
  allBut,
  getObjectValue
};
