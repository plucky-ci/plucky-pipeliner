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

module.exports = {
  isNumeric,
  allBut
};
