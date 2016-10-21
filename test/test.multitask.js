const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

const {
  Pipeline,
  Task
} = require('../');

const noop = ()=>{};

describe('MultiTask', ()=>{
  class MyTask1 extends Task{
    handler(state, next){
      next(0, {status: 'MyTask1 Success'});
    }
  };

  class MyTask2 extends Task{
    handler(state = {}, next){
      const {
        params = {}
      } = state;
      next(0, {lastStatus: params.status, status: 'MyTask2 Success'});
    }
  };

  const Lib = {
    MyTask1: new MyTask1(),
    MyTask2
  };

  const pipelineBase = new Pipeline({
    tasks: {
      test: Lib,
    }
  });

  it('executes sub tasks from a library', (done)=>{
    const pipeline = pipelineBase.clone({
      process: [
        {task: 'test.MyTask1'},
        {task: 'test.MyTask2'}
      ]
    });
    pipeline.execute(null, (code, value)=>{
      expect(code).to.equal(0);
      expect(value).to.equal({"lastStatus": "MyTask1 Success", "status": "MyTask2 Success"});
      return done();
    });
  });
});
