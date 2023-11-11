const { WebSocketServer } = require('ws') ;
const { v4 : uuidv4 } = require('uuid') ;
const  WorkManager = require('./workmanager') ; 

const workM = new WorkManager.WorkManager() ;
const wss = new WebSocketServer({ port: 8080 });

const connectedCompilers = [] ;
const connectedEmitters = [] ;

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
        connectedCompilers.push(ws) ; 
      }
      else if(json.type == 'emitter'){
        console.log('emitter is connected, ', ws.id);
        ws.type = 'emitter' ; 
        connectedEmitters.push(ws);
      }
      else{
        console.log('abnormality is connected and connection will be closed');
        ws.type = 'abnormal' ; 
        ws.terminate() ; 
      }
    }
    if(json.command == 'compile'){
      if(ws.type == 'emitter'){
        const {source} = json ; 
        console.log(source);
        console.log('creating workorder');
        //send work order
        const compilerSocket = connectedCompilers[Math.floor(Math.random()*connectedCompilers.length)];
        workM.createWorkOrder(ws, compilerSocket, source); 
      }
      if(ws.type == 'compiler'){
        const {workID, stdout, stderr} = json ;
        //complete workorder
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
    else if(ws.type == 'emitter'){
        console.log('emitter disconnected') ;
        const index = connectedEmitters.findIndex(socket => ws == socket) ;
        if(index != -1)
          connectedEmitters.splice(index, 1) ; 
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





