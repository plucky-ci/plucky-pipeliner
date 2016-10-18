const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

const {
  ConditionalTask,
} = require('./tasks/conditionaltask');
const {
  Task,
  Pipeline,
} = require('../');

const noop = ()=>{};

describe('ConditionalTask', ()=>{
  class WootTask extends Task{
    handler(state, next){
      const {
        params = {},
      } = state;
      return next(0, {status: ((params.status||'')+' Woot').trim()});
    }
  }
  class WatTask extends Task{
    handler(state, next){
      const {
        params = {},
      } = state;
      return next(0, {status: ((params.status||'')+' Wat').trim()});
    }
  }
  class FailTask extends Task{
    handler(state, next){
      return next(1, new Error('Fail!'));
    }
  }

  const pipelineBase = new Pipeline({
    tasks: {
      woot: WootTask,
      wat: WatTask,
      fail: FailTask,
      conditional: ConditionalTask,
    }
  });

  it('executes lastSucceeded when last step was a success', (done)=>{
    const pipeline = pipelineBase.clone({
      process: [
        {task: 'wat'},
        {
          task: 'conditional',
          lastSucceeded: {task: 'woot'},
          lastFailed: {task: 'wat'}
        }
      ]
    });
    pipeline.execute(null, (code, value)=>{
      expect(code).to.equal(0);
      expect(value).to.equal({status: 'Woot'});
      return done();
    });
  });

  it('executes lastFailed when last step failed', (done)=>{
    const pipeline = pipelineBase.clone({
      process: [
        {task: 'fail'},
        {
          task: 'conditional',
          lastSucceeded: {task: 'wat'},
          lastFailed: {task: 'woot'}
        }
      ]
    });
    pipeline.execute(null, (code, value)=>{
      expect(code).to.equal(0);
      expect(value).to.equal({status: 'Woot'});
      return done();
    });
  });
});
