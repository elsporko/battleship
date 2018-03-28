#!/usr/bin/python3
from battleship.fleet  import Fleet
from battleship.player import Player
#from battleship.move   import Move

print("Creating instances...")
print("Player...")
player=Player()
#print("Fleet...")
#fleet=Fleet()
#print("Move...")
#move=Move()

# Register
print("Register player")
player.register()
#print("Load other players")
#player.load_other_players()

# Set up board
print("Build fleet")
player.buildShips();
player.placeShips();

# Main game loop
while True:
    print("Main loop")
    # Listen for messages
    payload = player.sqs_client.receive_message(QueueUrl=player.queue.url, MaxNumberOfMessages=1, WaitTimeSeconds=20)
    print("Roster: ", player.playerRoster)
    print("Fleet: ", player.nauticalMap)
    # Accept registration from other players
    # Main loop steps:
    #  * Turn change
    #  * Check if still alive
    #  * Check for registration and react as needed (Add to known players, ACK?)
    #  * Make move(s)
    print ("should break")
    break
    print ("nope")

def process_message(message):
    payload = json.loads(message)
    actions = {
        'playuerReg': player.acceptReg(payload),
        'processMoves': player.processMoves(payload)
    }

    # Message formatted in comma delimited key/value pairs separated by semicolons
    try:
        actions[payload['action']]
    except KeyError:
        return
    
print("Cleanup subscription")
player.cleanup_subscription()

# Concurrent process to add already existing applicants to our roster

