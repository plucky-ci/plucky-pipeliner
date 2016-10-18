const {
  ProcessHandler,
  Task,
} = require('../');

class WootTask extends Task{
  handler(state, next){
    const {
      params = {},
    } = state;
    return next(0, {status: ((params.status||'')+' Woot').trim()});
  }
}

class AddTask extends Task{
  handler(state, next){
    const {
      params = {},
    } = state;
    const {
      accum = 0,
      term = 0
    } = params;
    return next(0, {accum: accum + term});
  }
}

const pipeline = new ProcessHandler({
  tasks: {
    woot: WootTask,
    add: new AddTask(),
  },
  process: [
    {
      task: 'woot',
    },
    {
      task: 'woot',
    },
    {
      task: 'woot',
      params: {
        status: 'WOOHOO'
      }
    },
    {
      task: 'add',
      params: {
        term: 3
      }
    },
    {
      task: 'add',
      params: {
        term: 6
      }
    },
    {
      task: 'add',
      params: {
        term: 9
      }
    },
    {
      task: 'add',
      params: {
        accum: 0,
        term: 9
      }
    },
  ]
});

pipeline.on('progress', (details)=>{
  // You could capture a stack trace here if needed
  console.log('progress', details.stepNumber, details.code, details.value);
});

pipeline.execute({}, (code, value)=>{
  console.log(code, value);
});
