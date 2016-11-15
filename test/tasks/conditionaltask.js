const {
  Task,
  ProcessHandler,
} = require('../../');

// This belongs in core, not in pipeline handler
// So it's just here for tests

class ConditionalTask extends Task{
  // This is probably wrong LOL
  execute(state, next){
    const pipeline = state.pipelineHandler;
    if(state.lastCode[state.lastCode.length-1] !== 0){
      const process = pipeline.clone({process: state.config.lastFailed});
      return process.execute(state, next);
    }
    const process = pipeline.clone({process: state.config.lastSucceeded});
    return process.execute(state, next);
  }
}

module.exports = {
  ConditionalTask
};
