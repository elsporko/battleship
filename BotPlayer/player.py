#!/usr/bin/python3
from battleship.fleet  import Fleet
from battleship.player import Player
#from battleship.move   import Move

print("Creating instances...")
print("Player...")
player=Player()

# Register
print("Register player")
player.register()

# Set up board
print("Build fleet")
player.buildShips();
player.placeShips();

# Main game loop
while True:
    # Listen for messages
    payload = player.sqs_client.receive_message(QueueUrl=player.queue.url, MaxNumberOfMessages=1, WaitTimeSeconds=20)
    # Accept registration from other players
    # Main loop steps:
    #  * Turn change
    #  * Check if still alive
    #  * Check for registration and react as needed (Add to known players, ACK?)
    #  * Make move(s)
    break

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


