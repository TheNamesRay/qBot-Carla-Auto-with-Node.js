var qBot = function() {
	this.thread = document.getElementById("qBot__thread");
	this.form = document.getElementById("qBot__form");
	this.input = document.getElementById("qBot__textBoxInput");
	this.speech = null;
	this.fluidMode = false;
	this.setClientEvent();
	this.thread.scrollTop = this.thread.scrollHeight;
};
qBot.prototype.setClientEvent = function() {
	var a = this,
		c = function(b) {
			b.preventDefault();
			a.send()
		};
	this.form.addEventListener ? 
		this.form.addEventListener("submit", c, !1) : 
			this.form.attachEvent && this.form.attachEvent("submit", c)
};
qBot.prototype.connect = function(host, port) {
	this.socket = io.connect(host + ":" + port, {
		reconnect: !0
	});
	this.firstContact();
	this.events();
};
qBot.prototype.toFluidMode = function() {
	this.fluidMode = true;
	annyang.start({
		autoRestart: false,
		continuous: false
	});
};
qBot.prototype.firstContact = function() {
	this.send('qBot__firstContact');
};
qBot.prototype.events = function() {
	this.socket.on('qBot__think', () => {
		this.think();
	});
	this.socket.on('qBot__serverMessage', (message, sound) => {
		if (sound) {
			this.playSound(sound);
		}
		this.createBubble(message, false);
	});
};
qBot.prototype.playSound = function(file) {
	if(annyang) annyang.pause();
	var audioFile = new Audio('qBot__sounds/en/female/' + file + '.ogg');
	if(this.fluidMode) {
		audioFile.addEventListener('ended', function() {
			annyang.start({
				autoRestart: false,
				continuous: false
			});
			Bot.speech = null;
		}, false);
	}
	audioFile.play();
};
qBot.prototype.think = function() {
	var thinkingNode = document.createElement("div");
	thinkingNode.className = "qBot__message";
	thinkingNode.id = "qBot__thinking";
	var thinkingBubble = document.createElement("div");
	thinkingBubble.className = "qBot__bubble";
	thinkingBubble.innerHTML = "<i class=\"qBot__loading qBot__bars\"></i> Thinking...";
	thinkingNode.appendChild(thinkingBubble);
	this.thread.appendChild(thinkingNode);
	this.thread.scrollTop = this.thread.scrollHeight;
};
qBot.prototype.endThinking = function() {
	var thinkingNode = document.getElementById("qBot__thinking");
	if (thinkingNode) thinkingNode.parentNode.removeChild(thinkingNode);
};
qBot.prototype.createBubble = function(a, c) {
	c || this.endThinking();
	var b = document.createElement("div");
	b.className = "qBot__message";
	var d = document.createElement("div");
	d.className = "qBot__bubble";
	c && (d.className = "qBot__bubble to__qBot");
	d.innerHTML = a;
	b.appendChild(d);
	this.thread.appendChild(b);
	this.thread.scrollTop = this.thread.scrollHeight;
	this.input.value = ""
};
qBot.prototype.send = function(val) {
	var a = val || this.input.value;
	"" != a.trim() && (val || this.createBubble(a, !0), this.socket.emit("qBot__clientMessage", a))
};