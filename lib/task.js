class Task{
  execute(state, callback){
    if(typeof(this.handler) === 'function'){
      // Buble up the error code
      if(state.lastCode[state.lastCode.length-1] !== 0){
        return callback(state.lastCode[state.lastCode.length-1], null);
      }
      return this.handler(state, callback);
    }
    throw new Error(`Task type "${this.name || this.constructor.name}" handler not implemented!`);
  }
}

module.exports = {
  Task,
};
