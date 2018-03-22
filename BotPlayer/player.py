#!/usr/bin/python3
from battleship.fleet  import Fleet
#from battleship.roster import Roster
from battleship.player import Player, Roster
#from battleship.move   import Move

print("Creating instances...")
print("Player...")
player=Player()
print("Fleet...")
fleet=Fleet()
#print("Move...")
#move=Move()

# Register
print("Register player")
player.register()
print("Load other players")
player.load_other_players()

# Main game loop
while True:
    # Main loop steps:
    #  * Turn change
    #  * Check if still alive
    #  * Check for registration and react as needed (Add to known players, ACK?)
    #  * Make move(s)

print("Cleanup subscription")
player.cleanup_subscription()

# Concurrent process to add already existing applicants to our roster

# Set up board
print("Build fleet")
fleet.buildShips();
fleet.placeShips();
