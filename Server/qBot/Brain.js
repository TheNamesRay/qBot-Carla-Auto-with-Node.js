"use strict"

var fs = require('fs'), md5 = require('md5');

class Brain
{
    constructor(socket)
    {
        this.dictionary = [];
        this.callbackDictionary = [];
        this.client = {};
        this.socket = socket;
        this.filename = md5(
            this.socket.handshake.address +
            this.socket.handshake.headers['user-agent']
        );
        this.remember();
        this.listen();
    }
    listen()
    {
        this.socket.on('qBot__clientMessage', (message) =>
        {
            this.calculate(message);
        });
        this.socket.on('disconnect', () =>
        {
            this.client.lastVisitEnd = Math.floor(Date.now() / 1000);
            this.createMemory();
        });
    }
    remember()
    {
        fs.readFile(`qBot/memory/${this.filename}.qbm`, (err, contents) =>
        {
            this.loadDictionary();
            if (err)
            {
                this.client = {
                    lastVisitStart: Math.floor(Date.now() / 1000),
                    lastVisitEnd: null,
                    name: null,
                    age: null
                };
                this.createMemory();
            }
            else
            {
                this.client = JSON.parse(contents.toString());
                this.client.lastVisitStart = Math.floor(Date.now() / 1000);
            }
        });
    }
    createMemory()
    {
        fs.writeFile(`qBot/memory/${this.filename}.qbm`, JSON.stringify(this.client, null, 4), (err) =>
        {
            if (err) throw err;
        });
    }
    calculate(message)
    {
        this.socket.emit('qBot__think');
        setTimeout(() =>
        {
            if (message == 'qBot__firstContact')
            {
                switch (true)
                {
	                case !this.client.lastVisitEnd:
	                    this.send(
                            "Hello! I'm Carla Auto. What can I help you with today?", 
                            "HELLO"
                        );
	                    break;

	                case this.client.lastVisitEnd && !this.client.name:
	                    this.send(
                            "Welcome back. I still don't know your name!", 
                            "WELCOME_BACK_NONAME"
                        );
	                    break;

	                case this.client.lastVisitEnd && this.client.name:
	                    this.send("Welcomebackknown");
	                    break;
                }
            }
            else
            {
                message.trim() == '' ? 
                    this.send("Please write something.", "PLEASE__WRITE") : 
                        this.analyze(message);
            }
        }, 1000);
    }
    loadDictionary()
    {
        fs.readFile('qBot/dictionary/generic.json', (err, contents) =>
        {
            if (err) throw err;
            this.dictionary.push(JSON.parse(contents.toString()));
        });
    }
    analyze(message)
    {
        var usingCallbackDictionary = this.callbackDictionary.length > 0,
       		dictionary = (this.callbackDictionary.length == 0) ? this.dictionary : this.callbackDictionary;
        
        if(usingCallbackDictionary) 
        	this.callbackDictionary = [];

        for (var i = dictionary.length - 1; i >= 0; i--)
        {
            for (var k in dictionary[i])
            {
                var condition = (dictionary[i][k].condition) ? 
                	new Function('return ' + dictionary[i][k].condition).bind(this)() : true;

                if (condition)
                {
                    if (this.stringContains(message, k))
                    {
                        if (dictionary[i][k].callbacks)
                        {
                            this.callbackDictionary.push(dictionary[i][k].callbacks);
                        };
                        var reply = this.shuffle(dictionary[i][k].responses)[0],
                            sound = null;
                        if (reply.indexOf('(sound)') > -1)
                        {
                            var strings = reply.split('(sound)');
                            sound = strings[1];
                            reply = strings[0];
                        };
                        return this.send(reply, sound);
                    };
                };
            };
        };
        this.send(
        	'I did not understand what you just said. But don\'t worry, I\'m getting better at this.', 
        	'NOT_UNDERSTAND'
        );
    }
    stringContains(string, words)
    {
        return (new RegExp(words, 'i')).test(string);
    }
    shuffle(o)
    {
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
    send(message, sound)
    {
        this.socket.emit('qBot__serverMessage', message, sound);
    }
}
module.exports = Brain;