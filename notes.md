// TODO: Build the param handler

jenkins:
  name: Jenkins-Pass
    URL: ...
    user: admin
    pass: very_secret
  name: Jenkins-Console-AWS
    URL: ...

pipeline:
  createBuild
    execute ./createbuild.sh pull <options>
    executeJenkins('Jenkins-PaaS', 'seedjob')
      executeJenkins('Jenkins-PaaS', 'console-server')
      executeJenkins('Jenkins-PaaS', 'console-ui')
        executeJenkins('Jenkins-PaaS', 'console-docker-image')
  deployToDev
  deployToStage
  deployToProd



task1 - Y
tast2 - Y
task3 -N <- Early out, return something?
task4

{
  code: <Number>,
  data: Bla....
}


step = (params, callback)=>{
  ...doSomething...
  if(err){
    return callback(1, data);
  }
  return callback(0, data);
};





{
  name: 'Build from source repo',
  description: 'Some optional description',
  imports: { // This doesn't get interperted by the pipeliner,
             // instead the loader should import the libs and map them to
             // tasks entries
    git: 'plucky-git',
    shell: 'plucky-shell',
  },
  tasks: {
    git: PluckyGit,
    ...
  },
  params: {
    gitRepoUrl: 'string',
  },
  globals: {
    jenkins1: {
      host: 'blll'
    },
    jenkins2: {
      host: 'baaa',
      auth: {
        user: 'boo',
        pass: 'bar'
      }
    },
    gitRepo: {
      url: 'git@git....' |
      url: {@parms: gitRepoUrl}
    }
  },
  process: [
    {
      task: 'git.pull',
      params: {@global: gitRepo}
    },
    {
      task: 'shell.execute',
      params: {script: './build.sh'}
    },
    {
      task: 'shell.execute',
      params: {script: './package.sh'}
    },
    {
      task: 'jenkins.execute',
      params: {
        job: 'myJenkinsJob',
        host: {'@global': 'jenkins.myJenkinsInstance.url'},
        auth: {'@global': 'jenkins.myJenkinsInstance.auth'}
      }
    }
  ],
}

{
  name: 'Build Notification',
  imports: {
    hipchat,
    email,
    conditional,
  },
  process: [
    {
      task: 'conditional',
      description: 'Send notifications on failure'
      params: {
        lastSucceeded: [
            {
              task: 'hipchat.message',
              params: {
                message: 'Hey {@params.task.type} using {@params.task.params} failed'
              }
            },
            {
              task: 'email.sendMail',
              params: {
                subject: 'Hey {@params.task.type} failed'
                body: {@params.task.params}
              }
            }
          ],
        lastFailed: {
            task: 'hipchat.message',
            description: 'Send notifications on success, falls into this if above process task does not hit',
            params: {
              message: 'Success!'
            }
          }
      }
    },
  ]
}
