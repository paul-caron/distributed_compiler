const sourceCode = `
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
` ;
const sourceCode3 = `
#include <iostream>
int main()
{
  std::cout << "hello world";
  return 0;
}
` ;
const sourceCode2 = `
#include <stdio.h>
int main()
{
  printf("hello world");
  return 0;
}
` ;

const {WebSocket} = require('ws') ;
const dotenv = require('dotenv') ;
dotenv.config();

const connect = async () => {
   const ws = new WebSocket(`ws://${process.env.HOST}:${process.env.PORT}`);

   ws.on('error', e =>{
      console.error(e) ;
   });

   ws.on('open', () => {
     console.log('connected') ;
   });

   ws.on('message', async (data) => {
     const json = JSON.parse(data) ;
     switch(json.command){
       //server requests identification
       case 'identify': console.log('server requesting identification') ;
                        await ws.send(JSON.stringify({command:'identify', type:'emitter'})); 
                        console.log('sending identification to server') ;
                        break;
       //server validated identification and awaits a job order
       case 'proceed':  console.log('identification succeeded') ;
                        console.log('sending code for compilation') ;
                        await ws.send(JSON.stringify({command: 'compile', source: sourceCode, language: 'go'}));
                        console.log('source code sent: ', sourceCode) ;
                        break;
       //server returns the output of the sourceCode execution
       case 'compile':  const {stdout, stderr} = json ;
                        console.log('stdout: ', stdout) ;
                        console.log('stderr: ', stderr) ;
                        break;
     }
   });

   ws.on('close', () => {
      console.log('connection closed');
   });
}

connect() ;

