const {WebSocket} = require('ws');
const fs = require('fs') ;
const child_process = require('child_process') ;
const dotenv = require("dotenv") ;
dotenv.config();


const compile = (source, language, stdin) => {
  const fileEnding = {
    'c': 'c',
    'cpp': 'cpp',
    'python': 'py',
    'perl': 'pl',
    'ruby': 'rb',
    'rust': 'rs',
    'go': 'go',
    'java': 'java',
    'sh': 'sh',
    'nodejs': 'js',
    'clojure': 'clj',
    'octave': 'm',
    'r': 'r',
  } ;
  const mount = `--mount type=bind,source="$(pwd)"/source,target=/source` ; 
  const network = `--network none` ;
  const image = `compiler_client_compiler` ;
  const timeout = 20 ;
  const capdrops =  `--cap-drop ALL `;
  const memory = `-m 512m` ;
  const cpus = `--cpus=2` ;
  fs.writeFileSync(`./source/main.${fileEnding[language]}`, source);
  fs.writeFileSync(`./source/stdin`, stdin);
  try{
    child_process.execSync(`timeout -s SIGKILL ${timeout} docker run ${cpus} ${memory} ${network} ${mount} --rm ${capdrops} ${image} /compilation_scripts/${language}.sh `) ;
  }catch(e){
    console.log(e) ;
    child_process.execSync(`echo 'error occured' >> ./source/stderr`) ;
  }
  const stdout = fs.readFileSync('./source/stdout').toString()
  const stderr = fs.readFileSync('./source/stderr').toString()
  fs.writeFileSync(`./source/stdout`, '');
  fs.writeFileSync(`./source/stderr`, '');
  child_process.execSync(`rm -rf ./source/*`) ;
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
                       const {workID, source, language, stdin} = json ;
                       console.log(workID, 'source code: ', source, language) ;
                       try {
                         const {stdout, stderr} = compile(source, language, stdin) ;
                         ws.send(JSON.stringify({command:'compile', workID: workID, stdout: stdout, stderr: stderr})) ; 
                       } catch(e){
                         ws.send(JSON.stringify({command:'compile', workID: workID, stdout: '', stderr: 'an error occured'})) ; 
                       }
                       break;
    }
  });

  ws.on('close', () => {
    console.log('connection was dropped by server. attempt to reconnect in 10s') ;
    setTimeout(connect, 10000) ;
  });


}

connect() ;

