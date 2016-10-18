const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

const {
  Task,
} = require('../');

const noop = ()=>{};

describe('ValidateTask', ()=>{
  class MyTask extends Task{
    constructor(args){
      super(args);
    }

    handler(params, next){
      next(0, {status: 'Success'});
    }
  };

  it('create a base task', (done)=>{
    const t = new Task();
    done();
  });

  it('throws error when handler not implemented', (done)=>{
    const t = new Task();
    try{
      t.execute({}, noop);
    }catch(e){
      e.toString().match(/not implemented/i);
      done();
    }
  });

  it('can create custom Tasks', (done)=>{
    const t = new MyTask();
    expect(t.execute).to.be.a.function();
    done();
  });

  it('custom tasks handlers can return values', (done)=>{
    const t = new MyTask();
    t.execute({lastCode: 0}, (code, val)=>{
      expect(code).to.equal(0);
      expect(val).to.equal({status: 'Success'});
      done();
    });
  });

  it('skips the handler if the lastCode is not 0', (done)=>{
    const t = new MyTask();
    t.execute({lastCode: 1}, (code, val)=>{
      expect(code).to.equal(1);
      expect(val).to.be.null();
      done();
    });
  });
});
