Plucky Pipeliner
===

Core package to manage process pipelines and execution.  Has some dev dependencies but no dependencies for normal every day usage.

Generally this package is used to string tasks together and return a result code and value.  Things like debugging, stack traces, etc can all be done by hooking events.

Install
---

```shell
npm install plucky-pipeliner
```

API
---

###Pipeline

Derives from ProcessHandler, currently introduces no additional functionality.  This is the class you should be implementing from.

###Task

####Task.execute(state, next)

Semi internal, generally you will put your worker code in the handler if your Task.  In some cases where you need to do things like trap previous errors, you will need to override execute.

**Params**

 * state - the current state being passed into your tasks
 * next(statusCode, value) - call then when your done with an exit code (0 for OK, positive number for failure) and a value.  You can pass a value on failures, example would be an error object.

####Task.handler(state, next) - Abstract

For *most* task types this is where you would put your code.  If for some reason you want to do your own pre-entry validation (as an example, don't skip previously failed steps) then you would override .execute.  See examples in test/tasks/ for some samples.

**Params**

 * state - the current state being passed into your tasks
 * next(statusCode, value) - call then when your done with an exit code (0 for OK, positive number for failure) and a value.  You can pass a value on failures, example would be an error object.

###ProcessHandler

This is the actual workhorse behind everything, it manages moving from one task to another and executing them.  Has no knowledge of success/fail status, that's all in the Tasks themselves.  Derives from EventEmitter, so also supports on, once, etc for event handling.

####ProcessHandler.constructor({name, description, params, tasks, process})

**Options**

 * name - The name of the process, good for debugging, optional.
 * description - A description of what the process does, optional.
 * params - Object containing any parameters passed in for configuration of tasks, base values, etc...
 * tasks - Object containing the task types and tasks that will be available to the process.
 * process - Array of task configurations.

####ProcessHandler.clone(options)

Used to create a clone of the existing process.  Useful for things like creating sub process tasks with the same parameters but a different process.

####ProcessHandler.getCodeValFrom(retCode, retVal) - Internal

Used to convert the result of a next call from a task into something we understand.  Used for things like switching a default node callback(err, value) format to pipeline format callback(code, value).

####ProcessHandler.runProcessStep(stepNumber, state, callback) - Internal

Actually manages running a process task, wrapping the next call with getCodeValFrom, and error trapping.

####ProcessHandler.execute(params, callback)

Used to execute the process and get the result.

**Params**

 * params - Object containing any parameter values needed for the process.
 * callback(returnCode, value) - Called when process has complete, code contains 0 for success or a positive number on a failure.  Value will contain either the result or the last error.

####Event:error(error)

Emitted when there is an error, passes a single parameter that contains the error.

####Event:step({stepNumber, step, state: newState})

Emitted when a process step is about to execute.  Single parameter that contains members for the stepNumber in the pipeline, the step that will be executed, and the state that will be passed to the task.

####Event:progress({stepNumber, step, code: codeNum, value})

Emitted when a process step has completed.  Single parameter that contains members for the stepNumber in the pipeline, the step that was executed, the return code, and the value returned.

####Event:steperror({stepNumber, step, code: codeNum, value})

Emitted when a process step has an error, internal or external.  Single parameter that contains members for the stepNumber in the pipeline, the step that was executed, the return code, and the value returned.

####Event:done({code, value})

Emitted once the entire pipeline has completed in both success and failure scenarios.  Single parameter that contains members for the return code and the value returned.

###utils

####utils.isNumeric(n: Any) -> Boolean

Tells if a value is numeric.  If the value is a string checks to ensure that the entire string is a valid numeric value.

####utils.allBut(o: Object, except: Array of String) -> Object

Used to copy rest paramerters from an object.  Since Node 6 (currently) does not support ...rest destructuring natively this is necessary.

Usage
---

See examples folder, but here is a quick sample:

```javascript
const {
  ProcessHandler,
  Task,
} = require('plucky-pipeliner');

class WootTask extends Task{
  static get params(){
    return {
      status: String
    }
  }

  handler(state, next){
    const {
      params = {},
    } = state;
    return next(0, {status: ((params.status||'')+' Woot').trim()});
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
  ]
});

pipeline.on('progress', (details)=>{
  // You could capture a stack trace here if needed
  console.log('progress', details.stepNumber, details.code, details.value);
});

pipeline.execute({}, (code, value)=>{
  console.log(code, value);
});
```
