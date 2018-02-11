#!/usr/bin/python3
from battleship import fleet
from battleship import ships
from battleship import player
from battleship import move

######################################
######################################
#
#/*** battleshipOne.js ***/
#
#fleet.init();
#player.gameFlow();
# Register
player.register();
#

#    grid.setMoveShip(); 
#        playGame();
#
#// Set up link to resolve moves
#let d=document.getElementById('doMoves');
#d.addEventListener('click',
#    function(){
#        // Resolve orders
#        move.resolveMoves();
#        // Reset moves
#        move.clearMoveList();
#        // Turn moves over to the next player
#        // FIXME - Simulating moves for now. Remove when ready for realsies
#
#    }, false);
#
#// Set up drag/drop of moves
#//document.getElementById('playOrder').setAttribute('draggable','true');
#//player.playerOrderHandler();
#
# Set random fleet
ships.buildShips();
ships.placeShips();

#/* 
# * Mock game will be removed 
# */
#let m = document.getElementById('MeganReg');
#m.addEventListener('click', 
#    function(){
#        player.acceptReg('Megan', 1);
#        document.getElementById('MeganReg').style.display='none';
#    }, false);
#
#let ry = document.getElementById('RyanReg');
#ry.addEventListener('click', 
#    function(){
#        player.acceptReg('Ryan', 2);
#        document.getElementById('RyanReg').style.display='none';
#    }, false);
#
#let tr = document.getElementById('TraceyReg');
#tr.addEventListener('click', 
#    function(){
#        player.acceptReg('Tracey', 3);
#        document.getElementById('TraceyReg').style.display='none';
#    }, false);
#
#/* Play game */
#/*
#while (1) {
#    player.getTurn();
#}
#*/
#
#function playGame(){
#    if (player.myTurn()){
#        //window.open('','attack', 'height=200,width=200,menubar=no,status=no,titlebar=no,toolbar=no', false );
#    }
#}
#
