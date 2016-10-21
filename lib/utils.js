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

const typeOf = (val)=>{
  if(Array.isArray(val)){
    return 'array';
  }
  if(val instanceof RegExp){
    return 'regexp';
  }
  if(val instanceof Date){
    return 'date';
  }
  return typeof(val);
}

const defaults = (...args)=>{
  const type0 = typeOf(args[0]);
  if(type0 === 'array'){
    return args[0].slice();
  }
  if(type0 !== 'object'){
    return args.find((elem)=>{
      return !!elem;
    });
  }
  return args.reduce((res, arg)=>{
    const typeA = typeOf(arg);
    if(typeA !== 'object'){
      return res;
    }
    if(!arg){
      return res;
    }
    return Object.keys(arg).reduce((res, key)=>{
      if(typeOf(res[key])!=='undefined'){
        return res;
      }
      const value = arg[key];
      const typeV = typeof(value);
      res[key] = value;
      return res;
    }, res);
  }, {});
};

module.exports = {
  isNumeric,
  allBut,
  getObjectValue,
  typeOf,
  defaults
};
