let port = 5000

// Application express
let express = require('express');
let app = express();
// Application pour envoyer infos par protocole HTTP
let http = require('http');
let server = http.Server(app);
// Permet de travailler avec dossiers/fichiers
let path = require('path');
// Permet comm. bidirectionnelle entre browser et serveur
let socketIO = require('socket.io');
let io = socketIO(server);

// Choix du port
app.set('port', port);
// static = fichiers pour usagers qui nont pas besoin detre modifie
// Specifie dossiers contenant fichiers publiques (__dirname = path absolu vers ce fichier)
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, './HermitsCodename.html'));
});

// Lancer le serveur
server.listen(port, function () {
	console.log('server au port:' + port);
})



// Handlers au socket
// Action lorsque quelqu'un se connecte
let players = {}
let readyCheck = 0;
let nbPlayers = 0;
let cards;

io.on('connection', function (socket) {

	socket.on('new player', () => {
		players[socket.id] = { name: '', team: '', role: '' };
		nbPlayers += 1;
	});

	socket.on('team', data => {
		player = players[socket.id];
		if (player.name === '') {
			player.name = data[0];
			player.team = data[1];

			io.sockets.emit('team', data);
		}
	});
	socket.on('removeTeamMember', data => {
		player = players[socket.id];
		socket.emit('removeTeamMember', player.name);
		player.name = '';
	})

	socket.on('role', data => {
		player = players[socket.id];
		player.role = data;
		socket.emit('role', [player.name, player.role]);
	})

	socket.on('ready', data => {
		if (data) {
			readyCheck++;
		} else {
			readyCheck--;
		}

		if (readyCheck == nbPlayers) {
			socket.emit('rock on!', randomizeCodenames());
			cards = randomizeTeamCards();
			socket.emit('visibility', [players, cards]);
		}
	});

	socket.on('choseCard', data => {
		let found = false;
		for (let i = 0; i < cards.length && !found; i++) {
			const element = cards[i];

			if (element.includes(data)) {
				socket.emit('choseCard', [i, data]);
				found = true;
			}
		}
		if (!found) { socket.emit('choseCard', [3, data]); }
	});
});


let fs = require('fs');
let codenames;
fs.readFile('codenames.txt', 'utf8', (err, data) => {
	codenames = data.split('\n');
});

function randomizeCodenames() {
	let gameCards = []
	for (let i = 0; i < 25; i++) {
		gameCards.push(codenames[Math.round(Math.random() * codenames.length)]);
	}
	return gameCards;
}

function randomizeTeamCards() {
	let teams = []
	let cards = []
	let doublay = []
	for (let j = 0; j < 2; j++) {
		let max = 8;
		let startingTeam = Math.floor(Math.random());
		if (startingTeam == j) { max++ ;}

		for (let i = 0; i < max; i++) {
			let r = Math.floor(Math.random() * 5);
			let c = Math.floor(Math.random() * 5);

			if (!doublay.includes('' + r + c)) {
				cards.push('' + r + c);
				doublay.push('' + r + c);
			} else {
				i--;
			}
		}
		teams.push(cards);
		cards = [];
	}

	return randomizeAssassin(doublay, teams);
}


function randomizeAssassin(doublay, teams) {
	while (true) {
		let r = Math.floor(Math.random() * 5);
		let c = Math.floor(Math.random() * 5);
		if (!doublay.includes('' + r + c)) {
			teams.push([''+r+c]);
			return teams;
		}
	}
}
