'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

var rooms = []
const ranks = [
  {rankName:'Admin',rankPrefix:'{ADMIN}',rankColor:'#e84c43'},
  {rankName:'Deafult',rankPrefix:'',rankColor:'#8a7978'},
]
var accounts = [
  {accName:'BBM',displayName:'BBM',friends:[],accountId:1,accPassword:'f61374852ca5c60c54d4a501c4bb051bb3f83aafe42aa58ff1f325fa3ad71e66',rank:ranks[0]}
]

wss.on('connection', (ws) => {
  ws.isAlive = true;
  var clientId = randomId(16);
  
  var yourPlayer = null
	
  var loggedIn = false;
  var accountLoggedIn = null;
  
  console.log('Client *'+clientId+'* connected');
  ws.on('message', function incoming(message) {
    if(message.startsWith('JOIN-')){
      var roomCode = message.split('-')[1]
      for(var x=0;x<rooms.length;x++){
      	var room = rooms[x]
	if(roomCode===room.roomCode){ws.send('JOINED_ROOM-'+room)}
      }
    }
    else if(message==='GET_NUM_ROOMS'){
      ws.send(rooms.length)
    }
    else if(message.startsWith('RES-NEW_ROOM-')){
      var isPrivate = JSON.parse(message.split('-')[2].toLowerCase())
      var player = { x:0,y:0,id:clientId,isHost:true }
      yourPlayer = player
      var maxPlayers = parseInt(message.split('-')[3])
      var gameMode = message.split('-')[4]
      
      var newRoom = { roomCode:randomRoomCode(6),roomId:randomId(16),playersArr:player,isPrivate:isPrivate,maxPLayers:maxPlayers,gameMode:gameMode }
      
      /* ROOM CONST
      	this.roomCode = randomRoomCode(6);
	this.roomId = randomId(16);
	this.playersArr = [ creator ];
	this.isPrivate = isPrivate;
	this.maxPlayers = maxPlayers;
	this.gameMode = gameMode;
     */
      
      /* PLAYER CONST
      	this.x = x
	this.y = y
	this.id = id
	this.isHost = isHost
      */
      
      rooms.push(newRoom)
      console.log(newRoom)
      console.log(player)
    }
    else if(message.startsWith('RES-LOGIN-')){
      if(loggedIn===false){  
	      var hashedUsername = sha256(message.split('-')[2]);
	      var hashedPassword = sha256(message.split('-')[3]);

	      for(var x=0;x<accounts.length;x++){
		var acc = accounts[x]
		if(hashedUsername===sha256(acc.accName) && hashedPassword===acc.accPassword){
		  loggedIn = true;
		  accountLoggedIn = acc
		  console.log(acc);
		}
      }  
    }
    else if(message==='RES-LOGOUT'){
    	if(loggedIn===true){
 	    loggedIn=false
	    accountLoggedIn=null
	}
	console.log('Logged out for Client '+clientId)
    }
    else{console.log('Already logged in!')}
	  
    }
    else{
      ws.send(message)
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

const interval  = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);
function randomRoomCode(length) {
    var chars = '0123456789'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

function roomConstructor(isPrivate,creator,maxPlayers,gameMode){
	this.roomCode = randomRoomCode(6);
	this.roomId = randomId(16);
	this.playersArr = [ creator ];
	this.isPrivate = isPrivate;
	this.maxPlayers = maxPlayers;
	this.gameMode = gameMode;
}
function playerConstructor(x,y,id,isHost){
	this.x = x
	this.y = y
	this.id = id
	this.isHost = isHost
}

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
function noop(){}
function heartbeat(){
  this.isAlive = true;
}












function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};
	
	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length'
	var i, j; // Used as a counter across the whole file
	var result = ''

	var words = [];
	var asciiBitLength = ascii[lengthProperty]*8;
	
	//* caching results is optional - remove/add slash from front of this line to toggle
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	var hash = sha256.h = sha256.h || [];
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];
	/*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}
	
	ascii += '\x80' // Append Ƈ' bit (plus zero padding)
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return; // ASCII check: only accept characters in range 0-255
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
	words[words[lengthProperty]] = (asciiBitLength)
	
	// process each chunk
	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
		var oldHash = hash;
		// This is now the undefinedworking hash", often labelled as variables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8);
		
		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			// Expand the message into 64 words
			// Used below if 
			var w15 = w[i - 15], w2 = w[i - 2];

			// Iterate
			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
				+ ((e&hash[5])^((~e)&hash[6])) // ch
				+ k[i]
				// Expand the message schedule if needed
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
					)|0
				);
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
			
			hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1)|0;
		}
		
		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}
	
	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
};
