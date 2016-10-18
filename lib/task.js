class Task{
  execute(state, callback){
    if(typeof(this.handler) === 'function'){
      // Buble up the error code
      if(state.lastCode !== 0){
        return callback(state.lastCode, null);
      }
      return this.handler(state, callback);
    }
    throw new Error(`Task type "${this.name || this.constructor.name}" handler not implemented!`);
  }
}

module.exports = {
  Task,
};
