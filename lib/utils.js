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

const jsonMapper = (obj, config) => {
	let objString = JSON.stringify(obj);
	const regex = /\${(.*?)}/g;
	let matches;
	let flattenedConfig = flattenObject(config);
	while((matches = regex.exec(objString)) !== null) {
		const token = matches[0];
		const key = matches[1];
		objString = objString.replace(token, flattenedConfig[key]);
	}

	return JSON.parse(objString, function(k, v) {
		if(!isNaN(parseFloat(v))) {
			return parseFloat(v);
		}
		if(v === 'true' || v === 'True') {
			return true;
		}
		if(v === 'false' || v === 'False') {
			return false;
		}
		return v;
	});
};

const flattenObject = (ob) => {
	let toReturn = {};
	
	for (let i in ob) {
		if (!ob.hasOwnProperty(i)) continue;
		
		if ((typeof ob[i]) == 'object') {
			let flatObject = flattenObject(ob[i]);
			for (let x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
				
				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
};

module.exports = {
  isNumeric,
  allBut,
  jsonMapper,
  flattenObject
};
