const EventEmitter = require('events');
const {
  isNumeric,
  allBut,
} = require('./utils');

class ProcessHandler extends EventEmitter{
  constructor(options = {}){
    super();
    const {
      name,
      description,
      params = {},
      tasks = {},
      process: pipelineProcess = [],
    } = options;
    this.name = name || this.constructor.name;
    this.description = description;
    this.options = options;
    this.taskTypes = {};
    this.meta = allBut(options, ['name', 'description', 'params', 'tasks', 'process']);
    this.tasks = Object.keys(tasks).reduce((handlers, taskName)=>{
      const runner = tasks[taskName];
      const type = typeof(runner);
      switch(type){
        case('function'):
          handlers[taskName] = new runner();
          break;
        default:
          handlers[taskName] = runner;
      }
      return handlers;
    }, {});
    this.params = params;
    this.process = (Array.isArray(pipelineProcess)?pipelineProcess:[pipelineProcess]).filter((item)=>!!item);
  }

  clone(options){
    const newOptions = Object.assign({}, this.options, options);
    const handler = new ProcessHandler(newOptions);
    const wrap = (event)=>handler.on(event, (...args)=>this.emit(event, ...args));
    wrap('error');
    wrap('step');
    wrap('progress');
    wrap('steperror');
    wrap('done');
    return handler;
  }

  getCodeValFrom(retCode, retVal){
    // Check if an error was returned in place of code
    if(!isNumeric(retCode)){
      return {
        code: 1,  // Return a status code 1, error
        value: code // Return the code as the result
      };
    }
    return {
      code: (retCode===null)||(typeof(retCode)==='undefined')?0:retCode,
      value: retVal
    };
  }

  runProcessStep(stepNumber, state, callback){
    const stepConfig = this.process[stepNumber];
    if(!stepConfig){
      const e = new Error(`No configuration defined for step ${stepNumber}`);
      this.emit('error', e);
      return callback(-1, e);
    }
    if(!stepConfig.task){
      const e = new Error(`No task type defined for step ${stepNumber}`);
      this.emit('error', {error: e, config: stepConfig});
      return callback(-1, e);
    }
    const step = this.tasks[stepConfig.task];
    if(!step){
      const e = new Error(`No task handler defined for ${stepConfig.task}`);
      this.emit('error', {error: e, config: stepConfig, step});
      return callback(-1, e);
    }
    const stepComplete = (retCode, retVal)=>{
      const {
        code,
        value
      } = this.getCodeValFrom(retCode, retVal);
      const codeNum = +code; // Make sure we have a valid number
      // Trap progress events to capture stack traces
      this.emit('progress', {stepNumber, step, code: codeNum, value});
      if(codeNum !== 0){
        this.emit('steperror', {stepNumber, step, code: codeNum, value});
      }
      return callback(codeNum, value);
    };
    try{
      const newState = Object.assign({}, state, {pipelineHandler: this});
      newState.params = Object.assign({}, state.params, stepConfig.params);
      newState.config = stepConfig;
      this.emit('step', {stepNumber, step, state: newState});
      // Have to do it this way so that we don't catch errors in the callback
      // setImmediate should break the catch scope allowing callback errors
      // to bubble out
      return step.execute(newState, (...args)=>setImmediate(stepComplete, ...args));
    }catch(e){
      this.emit('error', e);
      return callback(1, e);
    }
  }

  execute(params, callback){
    const l = this.process.length;
    if(l === 0){
      return setImmediate(()=>callback(0, null));
    }
    const nextStep = ({lastCode = 0, lastState, stepNumber = 0, params = {}} = {})=>{
      this.runProcessStep(stepNumber, {lastCode, lastState, params}, (code, value)=>{
        const nextStepNumber = stepNumber + 1;
        // Reached the end of the pipeline, exit and return the final code and value
        if(nextStepNumber === l){
          this.emit('done', {code, value});
          return callback(code, value);
        }
        // Perform the next step
        return setImmediate(()=>{
          const nextParams = Object.assign({}, params, value);
          return nextStep({
            stepNumber: nextStepNumber,
            lastCode: code,
            lastState: value,
            params: nextParams,
          });
        });
      });
    };
    return nextStep();
  }
};

module.exports = {
  ProcessHandler,
};
