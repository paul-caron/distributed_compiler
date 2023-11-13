const { WebSocketServer } = require('ws') ;
const { v4 : uuidv4 } = require('uuid') ;
const  WorkManager = require('./workmanager') ; 
const dotenv = require('dotenv') ;
dotenv.config() ;

const workM = new WorkManager.WorkManager() ;
const wss = new WebSocketServer({ port: process.env.PORT });

const connectedCompilers = [] ;
const emittersQueue = [] ; //TODO: implement queuing

//returns compiler or false (if no compiler available)
function getAvailableCompiler(){
  const availables = connectedCompilers.filter( c => !c.busy ) ; 
  if (availables.length === 0) return false ; //no compilers currently available
  return availables[0] ; 
}

function heartbeat(){
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  ws.id = uuidv4();

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const json = JSON.parse(data) ;
    console.log(json);
    if(json.command == 'identify'){
      if(json.type == 'compiler'){
        console.log('compiler is connected, ', ws.id);
        ws.type = 'compiler' ;
        ws.busy = false ; 
        connectedCompilers.push(ws) ;
        ws.send(JSON.stringify({command:'proceed'}));
      }
      else if(json.type == 'emitter'){
        console.log('emitter is connected, ', ws.id);
        ws.type = 'emitter' ;
        ws.send(JSON.stringify({command:'proceed'}));
      }
      else{
        console.log('abnormality is connected and connection will be closed');
        ws.type = 'abnormal' ;
        ws.terminate() ;
      }
    }
    if(json.command == 'compile'){
      if(ws.type == 'emitter'){
        const {source, language} = json ;
        console.log(source, language);
        console.log('creating workorder');
        const compilerSocket = getAvailableCompiler() ;
        if(compilerSocket){
          workM.createWorkOrder(ws, compilerSocket, source, language);
        }
        else{
          //TODO implement queuing

          //no queuing for now, so will just return error
          ws.send(JSON.stringify({command:'compile', stdout:'', stderr:'All compilers are currently busy. Please try again later.'})) ;
        }
      }
      if(ws.type == 'compiler'){
        const {workID, stdout, stderr} = json ;
        workM.completeWorkOrder(workID, stdout, stderr) ;
      }
    }
  });

  ws.on('pong', heartbeat) ;

  ws.on('close', () => {
    if(ws.type == 'compiler'){
        console.log('compiler disconnected') ;
        const index = connectedCompilers.findIndex(socket => ws == socket) ;
        if(index != -1)
          connectedCompilers.splice(index, 1) ;
    }
  }) ;

  const identifyResponseCheck = () => {
    if(!ws.type || !(ws.type=='compiler' || ws.type=='emitter')) ws.terminate() ; 
  }

  ws.send(JSON.stringify({command: 'identify'}));
  setTimeout(identifyResponseCheck, 10000) ; //10 seconds delay to get identity type 

  console.log('client connected') ;

});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000); //ping each connection every 30 seconds

wss.on('close', () => {
  clearInterval(interval) ;
  console.log('server closed') ;
}) ;





