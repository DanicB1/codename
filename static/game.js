
let socket = io();

// emit l'arrive d'un nouveau joueur
socket.emit('new player');

// emit equipe choisi
// S'ajoute a une equipe
$('.addToTeam').mouseup(function() {
	if (this.id === 'addToTeamRed') 		{ socket.emit('team', [$('#playerNameRED').val(), 'Red']); $('#playerNameRED').val(''); }
	else if (this.id === 'addToTeamBlue') 	{ socket.emit('team', [$('#playerNameBLUE').val(), 'Blue']); $('#playerNameBLUE').val(''); }
});
socket.on('team', (data) => {
	$('#table'+data[1]).find('tbody').append('<tr><td class="teamMember" id="'+data[0]+'">'+data[0]+'</td></tr>');
	$('td[id="'+data[0]+'"').append('<input class="byeTeamMember" id="'+data[0]+'" type="button" value="X"></input>');
	$('.byeTeamMember').mouseup(function() {
		socket.emit('removeTeamMember');
	});
});
//Se retire d'une equipe
socket.on('removeTeamMember', data => {
	$('td[id='+data+']').parent().remove();
});


//Choix d'un role
$('.roleButtons').mouseup(function() {
	if (this.id === 'hawtie') 		{ socket.emit('role', 'Hawtie'); }
	else if (this.id === 'normie') 	{ socket.emit('role', 'Normie'); }
});
socket.on('role', data => {
	$('td[id="'+data[0]+'"').text(data[0] + ' - ' + data[1]);
	$('td[id="'+data[0]+'"').append('<input class="byeTeamMember" id="'+data[0]+'" type="button" value="X"></input>');
	$('.byeTeamMember').mouseup(function() {
		socket.emit('removeTeamMember');
	});
});


let ready = false;
$('#playButton').mouseup(function() {
	socket.emit('ready', true);
	ready = !ready;
	ready ? $('#playButton').val('NoNoNo!') : $('#playButton').val('GoGoGo!')
});
socket.on('rock on!', data => {
	$('#menu').remove();
	$('main').append('<div id="gameGrid" class="vertical-flex absolute absolute-center"></div>');
	for (let r = 0; r < 5; r++) {
		$('#gameGrid').append('<div class="flex space-evenly row"></div>')
		for (let c = 0; c < 5; c++) {
			$('.row:last-of-type').append('<input class="card" id="'+r+c+'" type="button" value="'+data[r*5+c]+'">')
		}
	}

	$('input[class=card]').mouseup(function() {
		socket.emit('choseCard', this.id);
	});
	socket.on('choseCard', data => {
		$('#'+data[1]).addClass(getTeamColor(data[0])+'TeamCard');
		$('#'+data[1]).val('');
	})
});

socket.on('visibility', data => {
	if (data[0][socket.id].role === 'Hawtie') {
		for (let i = 0; i < data[1].length; i++) {
			const element = data[1][i];
			let color = getTeamColor(i);

			for (let j = 0; j < element.length; j++) {
				$('#'+element[j]).addClass(color);
			}
		}
	}
});

function getTeamColor(i) {
	let color;

	if (i == 0) {
		color = 'red';
	} else if (i == 1) {
		color = 'blue';
	} else if (i == 2) {
		color = 'black';
	} else {
		color = 'beige';
	}

	return color;
}