var player = require('../../static/javascript/player.js');

//var myself;

describe("Player creation - self and other players", function(){
	/* TBD - build when Rabbit is up and running
    beforeEach(function(){
	//myself = player.register();
        })
    it("creation of self", function(){
    });
	*/

    it("test players joining the game", function(){
	player.acceptReg('Tracey',1);
	player.acceptReg('Megan',2);
	player.acceptReg('Ryan',3);
	    
	// Tracey is player 2 so move on to the 'next' player and then check
	player.nextPlayer();
	var thisplayer = player.currentPlayer();
	expect(thisplayer).toBe('Tracey');

	player.nextPlayer();
	thisplayer = player.currentPlayer();
	expect(thisplayer).toBe('Megan');

	player.nextPlayer();
	thisplayer = player.currentPlayer();
	expect(thisplayer).toBe('Ryan');
    })
});


describe("Turn management", function(){
    it("My turn check and player turn management", function(){
	player.register('elsporko');
	player.nextPlayer();
	var mt = player.myTurn();

	expect(mt).toBe(1);
	
	// Move the turn dial and make sure it's not 'me' still
	player.nextPlayer();

	mt = player.myTurn();
	expect(mt).toBe(0);

	// Move the turns one more time to make sure the turn list is circular
	player.nextPlayer();
	player.nextPlayer();
	player.nextPlayer();

	mt = player.myTurn();
	expect(mt).toBe(1);
    })
});
