Battleship registration service

This module is responsible for two main things:
    1. Maintain player order values.
    2. Ensure player handles are unique

Before applicants can set up their grids the player needs to register their handle. The handle is used to distinguish players against each other. For example, there can be only one player named 'elsporko' so once it is registered no one else can use it. The handle will also be used to name queues for direct messaging.

The registration service will also maintain player order values so it is universally understood who goes when. Player order will either be determined on a first come first serve basis, meaning the first player to successfully register will be player 1, the next will be player 2, etc. Alternatively player order could be determined by a random number which would add the complexity of assuring that the same value is not duplicated and determining a range for the random value. More complex but more fun.

