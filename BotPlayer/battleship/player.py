import boto3

class Player:
    def __init__(self):
        self.playerRoster = {} # Placeholder for all players in the game
        self.playerOrder = [0 for x in range(100)] # Order of player turn
        #self.chart =[[0 for x in range(10)] for y in range(10)] # Map of ship locations
        self.me = {}
        self.orderIndex = 0
        self.flow = ['register','game']
        self.sns_client = boto3.client('sns')
        self.sqs_client = boto3.client('sqs')
        self.fake_names = ['Hugh Mann', 'elsporko', 'Amanda Hugenkiz', 'Not A Bot']
        #self.currentFlow: undefined
        
    def canMove(self):
        if self.playerOrder.length > move.getMoveSize():
            return true;
        return false;

    # Register handle
    def register(self,handle):
        queue = self.sqs_client.get_queue_by_name(QueueName='Battleship_Registration.fifo')
        #queue = sqs_client.create_queue(QueueName='Battleship_Registration.fifo', Attributes={'FifoQueue':'true', 'ContentBasedDeduplication': 'true'})
        #TODO Create a random string representing the queue to use for this player. Check to make sure it does not already exist before creating it.
        sqs_arn = queue.get_queue_attributes(QueueUrl=queue['QueueUrl'], AttributeNames=['QueueArn'])['Attributes']['QueueArn']

        # This topic should already exist but creation is idempotent and we need the arn to subscribe to it
        game_topic = self.sns_client.create_topic(Name='Battleship_Registration')
        sns_arn = game_topic['TopicArn']

        self.sns_client.subscribe(TopicArn=sns_arn, Protocol='sqs', Endpoint=sqs_arn)
        self.sns_client.publish(TopicArn=sns_arn, Message='Comet is helping')

        my_topic = self.sns_client.create_topic(Name='elsporko')

        #self.me = handle # Self identify thineself
        # TODO - call out to the registration service and get back handle and turn order. This
        # structure represents the return call from the registration service.
        #reg = { 'handle': 'elsporko',
        #        'order': 0
        #}

        self.playerOrder[reg['order']] = reg['handle']
        return

     # Accept registration from other players
    def acceptReg(self, handle, order):
        self.playerOrder[order] = handle;
        self.playerRoster = {
            [handle]: {'pgrid': fleet.buildNauticalChart}
        }

    def myTurn(self):
        return (1,0)[self.currentPlayer() == self.me]

    def nextPlayer(self):
        self.orderIndex = (0, self.orderIndex + 1)[self.orderIndex == self.playerOrder.length - 1]
        return;

    def currentPlayer (self):
        return self.playerOrder[self.orderIndex];

    def gameFlow(self):
        if self.currentFlow != undefined:
            self.currentFlow+=1
        else:
            self.currentFlow = 0

    def setMove(self, m):
        return move.setMove(m);


