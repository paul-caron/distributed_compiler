const {WebSocket} = require('ws');
const fs = require('fs') ;
const child_process = require('child_process') ;
const dotenv = require("dotenv") ;
dotenv.config();


const compile = (source) => {
  const compile_command = ` clang -O1 -o ./source/main ./source/main.c 2> ./source/stderr 1> ./source/stdout` ;
  const execute_command = ` ./source/main ./source/main.c 2>> ./source/stderr 1>> ./source/stdout ` ;
  const mount = `--mount type=bind,source="$(pwd)"/source,target=/source` ; 
  const network = `--network none` ;
  const image = `compiler_client_compiler` ;
  fs.writeFileSync("./source/main.c", source);
  
  child_process.execSync(`docker run ${network} ${mount} --rm ${image} ${compile_command} `) ;
  child_process.execSync(`docker run ${network} ${mount} --rm ${image} ${execute_command} `) ;
  const stdout = fs.readFileSync('./source/stdout').toString()
  const stderr = fs.readFileSync('./source/stderr').toString()
  return {stdout: stdout, stderr: stderr} ;
}



const connect = () => {
  const ws = new WebSocket(`ws://${process.env.HOST}:${process.env.PORT}`);

  ws.on('error', e =>{
     console.error(e) ;
  });

  ws.on('open', () => {
    console.log('connected') ;
  });

  ws.on('message', (msg) => {
    const json = JSON.parse(msg) ;
    switch(json.command){
      case 'identify': ws.send(JSON.stringify({command:'identify', type: 'compiler'}));
                       break;
      case 'compile':  const {workID, data} = json ;
                       console.log(workID, data) ;
                       const {stdout, stderr} = compile(data) ;
                       ws.send(JSON.stringify({command:'compile', workID: workID, stdout: stdout, stderr: stderr})) ; 
                       break;
    }
  });

  ws.on('close', () => {
    console.log('connection was dropped by server. attempt to reconnect in 10s') ;
    setTimeout(connect, 10000) ;
  });


}

connect() ;

