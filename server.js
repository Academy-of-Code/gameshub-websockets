'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const supportedSockets = ["ChatApp1"]
var clients = []

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  var websocketReason = 'Unknown'
  var clientId = randomId(16);
  
  var clientJSON = {id:clientId,reason:websocketReason,socketClient:ws}
  clients.push( clientJSON )
  
  console.log('Client *'+clientId+'* connected');
  ws.on('message', function incoming(message) {
    if(message.startsWith('REASON-')){
      var reason = message.split('-')[1];
      websocketReason = reason
      var index = findIndex(clients,id,clientID);
      clients[index].reason = websocketReason
      console.log(`websocketReason is now ${websocketReason}, it should be ${reason}`)
    }
    else{
      console.log(message);
      if(websocketReason === 'ChatApp1'){ ChatApp1(message,ws,clientId); }
    }
  })
  
  ws.on('close', function close() {
    console.log('Client *'+clientId+'* disconnected')
  });
  ws.on('pong', heartbeat);
});
wss.on('close', function close() {
  clearInterval(interval);
})

function ChatApp1(msg,client,clientID){
  if( msg.startsWith("SEND_MSG_ALL-") ){
    var clientMessage = msg.split('-')[1];
    clients.forEach(function each(clientA) {
      if(clientA.reason==='ChatApp1'){
        clientA.ws.send( clientMessage );
        console.log('DEBUG MSG')
      }
      else{
        console.log(clientA.reason+", this reason wasn't identical to 'ChatApp1' ")
      }
    });
  }
}

const interval  = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);
function randomId(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
function findIndex(arr, propName, propValue) {
  for (var i=0; i < arr.length; i++)
    if (arr[i][propName] == propValue)
      return arr[i];

  // will return undefined if not found; you could return a default instead
}
function noop(){}
function player(x,y,id){
  this.x = x
  this.y = y
  this.id = id
}
function heartbeat(){
  this.isAlive = true;
}
