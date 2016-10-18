const {
  matches,
} = require('mongo-bout');

const {
  Task,
} = require('../../');

// This belongs in core, not in pipeline handler
// So it's just here for tests

class ValidateTask extends Task{
  constructor(options = {}){
    super(options);
    const {
      condition = false
    } = options;
    this.condition = condition;
  }

  validateOkToRun(state = {}){
    if(this.condition){
      const type = typeof(this.condition);
      switch(type){
        case('function'):
          return this.condition(state);
        case('number'):
          return state.lastCode === this.condition;
        case('object'):
          return matches(this.condition, state);
        case('string'):
          const f = new Function('state', `return ${this.condition};`);
          return f(state);
      }
    }
    if((state.lastCode === 0) || (typeof(state.lastCode) === 'undefined')){
      return true;
    }
    return false;
  }

  execute(state, callback){
    if(!this.validateOkToRun(state)){
      return callback(1, null);
    }
    if(typeof(this.handler) === 'function'){
      return this.handler(state, callback);
    }
    throw new Error(`Task type "${this.name || this.constructor.name}" handler not implemented!`);
  }
}

module.exports = {
  ValidateTask
};
