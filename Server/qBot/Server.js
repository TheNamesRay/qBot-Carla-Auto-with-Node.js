"use strict"

var http = require('http'), socketIo = require('socket.io');

class qBotServer 
{
	constructor() 
	{
		this.chatters = [];
	}
	prepare() 
	{
		this.server = http.createServer();
		this.io = socketIo(this.server);
		return this;
	}
	listen() 
	{
		this.server.listen(3000, function() {
			console.log('Server started on port 3000')
		});
	}
	addConnection(Socket) 
	{
		this.chatters.push(Socket);
	}
}

module.exports = qBotServer;