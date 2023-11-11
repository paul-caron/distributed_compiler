const { v4 : uuidv4 } = require('uuid') ;

class WorkManager{
  workOrders = new Map() ; 
  constructor(){

  }
  //data = JSON.stringify({language, source, stdin})
  createWorkOrder(emitterSocket, compilerSocket, data){
    const workID = uuidv4() ; 
    console.log('creating workID ', workID) ;
    this.workOrders.set(workID , {emitter: emitterSocket, 
                             compiler: compilerSocket, 
                             data: data} ) ; 
    compilerSocket.send(JSON.stringify({command:'compile', workID: workID, data: data}));
  }
  completeWorkOrder(workID, stdout, stderr){
    const wo = this.workOrders.get(workID) ;
    wo.emitter.send(JSON.stringify({command: 'compile', stdout: stdout, stderr: stderr}));
    this.workOrders.delete(workID) ;
    wo.emitter.terminate() ;
    console.log('completed workorder', workID) ; 
  }
};

module.exports = { WorkManager } ;

