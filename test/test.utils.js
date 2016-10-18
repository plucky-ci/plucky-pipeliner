const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

const {
  jsonMapper
} = require('../lib/utils');

const noop = ()=>{};

describe('jsonMapper', ()=>{
  it('return the original object', (done)=>{
    const obj = {foo: 'bar'};
    const newObj = jsonMapper(obj, {});
    expect(newObj).to.be.an.object();
    expect(newObj).to.equal(obj);
    done();
  });

  it('should replace deep linked tokenized string', (done) => {
    const config = {
      foo: {
        bar: {
          fun: 'asdf'
        }
      }
    };
    const obj = {
      foo: "${foo.bar.fun}"
    };

    const newObj = jsonMapper(obj, config);

    expect(newObj).to.be.an.object();
    expect(newObj.foo).to.equal('asdf');

    done();
  });

  it('should replace tokenized string with a number', (done) => {
    const config = {
      foo: {
        bar: {
          fun: 10
        }
      }
    };
    const obj = {
      foo: "${foo.bar.fun}"
    };

    const newObj = jsonMapper(obj, config);

    expect(newObj).to.be.an.object();
    expect(newObj.foo).to.be.a.number();
    expect(newObj.foo).to.equal(10);

    done();
  });

  it('should replace tokenized string with a boolean', (done) => {
    const config = {
      foo: {
        bar: {
          fun: false
        }
      }
    };
    const obj = {
      foo: "${foo.bar.fun}"
    };

    const newObj = jsonMapper(obj, config);

    expect(newObj).to.be.an.object();
    expect(newObj.foo).to.be.a.boolean();
    expect(newObj.foo).to.equal(false);

    done();
  });
});
