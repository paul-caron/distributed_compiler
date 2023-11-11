const {WebSocket} = require('ws') ;


const connect = async () => {
   const ws = new WebSocket('ws://localhost:8080');

   ws.on('error', e =>{
      console.error(e) ;
   });

   ws.on('open', () => {
     console.log('connected') ;
   });

   ws.on('message', async (data) => {
     const json = JSON.parse(data) ;
     switch(json.command){
       case 'identify': console.log(data.toString()) ;
                        await ws.send(JSON.stringify({command:'identify', type:'emitter'})); 
                        console.log('identified') ;
                        await ws.send(JSON.stringify({command: 'compile', source: '#include <stdio.h>\nint main(){printf("hello world");return 0;}'}));
                        console.log('code sent for compilation') ;
                        break;
       case 'compile': const {stdout, stderr} = json ;
                       console.log(stdout, stderr) ;
                       break;
     }
   });

   ws.on('close', () => {
      console.log('connection closed');
   });
}

connect() ;
 
