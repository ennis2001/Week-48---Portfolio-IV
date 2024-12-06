Tasks implemented:

** The starting level has an empty slot in the surrounding wall. This slot should function as a door into the level called "aSharpPlace." 
   Implement the door functionality so that the player can proceed to the next level.
   |_> Used the empty slot in order to place a door "D" which leads to the next level (map1 -> aSharpPlace).

** Create a new level (a third level) and link the unused door in "aSharpPlace" to exit into the new room.
   |_> Created a third room/map in a file called `level3.txt`. 
       |_> Also created a "D" for the player "H" to go through in (aSharpPlace -> level3).

** In "aSharpPlace," implement teleport functionality for the "♨︎" symbols. Entering one should move the player to the other.  
   |_> Implemented teleport functionality for the "♨︎" symbols in aSharpPlace.

** Ensure that when going back through a door, the player returns to the correct room.  
   |_> Added a door "D" to level3 so the player "H" can go back to the previous room (level3 -> aSharpPlace).

** Make the X NPC characters perform a simple patrol (+/-2 from their starting locations).  

** Create an animated splash screen (this was a group assignment from a previous week) using `splashScreen.mjs`. 
   |_> Added animation to the splashScreen by cycling through three colours every second for three seconds before the game starts.
