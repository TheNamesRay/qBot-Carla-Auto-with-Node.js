"use strict"

var Server = 
	require('./qBot/server'), 
		Brain = require('./qBot/brain');

global.Server = new Server;

global.Server.prepare().listen();

global.Server.io.on('connection', function(Socket) {
	var qBotBrain = new Brain(Socket);
	global.Server.addConnection(Socket);
});
