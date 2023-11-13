const {WebSocket} = require('ws');
const fs = require('fs') ;
const child_process = require('child_process') ;
const dotenv = require("dotenv") ;
dotenv.config();


const compile = (source, language) => {
  const fileEnding = {
    'c': 'c',
    'cpp': 'cpp',
    'python': 'py',
    'perl': 'pl',
    'ruby': 'rb',
  } ;
  const mount = `--mount type=bind,source="$(pwd)"/source,target=/source` ; 
  const network = `--network none` ;
  const image = `compiler_client_compiler` ;
  fs.writeFileSync(`./source/main.${fileEnding[language]}`, source);
  child_process.execSync(`docker run ${network} ${mount} --rm ${image} /compilation_scripts/${language}.sh `) ;
  const stdout = fs.readFileSync('./source/stdout').toString()
  const stderr = fs.readFileSync('./source/stderr').toString()
  fs.writeFileSync(`./source/stdout`, '');
  fs.writeFileSync(`./source/stderr`, '');
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
      case 'identify': console.log('server requesting identification') ;
                       ws.send(JSON.stringify({command:'identify', type: 'compiler'}));
                       break;
      case 'proceed':  console.log('identification succeeded'); break;
      case 'compile':  console.log('server requesting a compilation') ;
                       const {workID, source, language} = json ;
                       console.log(workID, 'source code: ', source, language) ;
                       const {stdout, stderr} = compile(source, language) ;
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

