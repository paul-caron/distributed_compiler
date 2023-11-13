const { v4 : uuidv4 } = require('uuid') ;

class WorkManager{
  workOrders = new Map() ;
  constructor(){

  }
  createWorkOrder(emitterSocket, compilerSocket, source, language){
    const workID = uuidv4() ;
    console.log('creating workID ', workID) ;
    this.workOrders.set(workID , {emitter: emitterSocket,
                             compiler: compilerSocket,
                             source: source, language: language} ) ;
    compilerSocket.busy = true ;
    compilerSocket.send(JSON.stringify({command:'compile', workID: workID, source: source, language: language}));
  }
  completeWorkOrder(workID, stdout, stderr){
    const wo = this.workOrders.get(workID) ;
    wo.emitter.send(JSON.stringify({command: 'compile', stdout: stdout, stderr: stderr}));
    this.workOrders.delete(workID) ;
    wo.emitter.terminate() ;
    wo.compiler.busy = false ;
    console.log('completed workorder', workID) ;
  }
};

module.exports = { WorkManager } ;

