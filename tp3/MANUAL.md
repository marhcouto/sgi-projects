# Users Manual

## Starting the program

In order to run our game, all that is needed is for the user to have a browser (opera, chrome, safari, etc.)
in their computer, the WebCGF library code in root folder and
a tool capable of hosting a server (python will do just fine).

### Launching the server

In order to start a self-hosted server with python using the terminal and python, 
run the following commands from the root of the project (where CGF library is):
```shell
# python -m http.serve <port>, in this example, port will be 8080
python -m http.server 8080
```
### Accessing the program

After the server is launched, all the user is required to do is to:

- access the server's address in the browser ("localhost:8080" in the case above)
- click on the tp3 folder

## Using the program (playing the game)

The game developed is a checkers game. The program includes animations for the game, 
as well as some other functionality in the form of 3D clickable objects and web 
interface.

### Playing the Game

From the moment the program starts, the game is on. All the user needs to do to move a piece is
click in the house of the desired piece and click on the desired destination house.
If the move is invalid, the program will advert the user through a browser alert. The rules
of the game are the typical rules for checkers. The game is a full implementation
of a checkers game, with captures, animated pawn to king upgrades and captures, etc.
When winning conditions are met, the user is notified through an alert, after which the
board becomes locked. To restart another game, the user must click the reset button,
mentioned in [this section](#3d-clickable-objects-menu).

### Web Interface - Scenes and Cameras

The default scene for the game is a void scene called "testScene". The user may
change the scenario involving the board through the interface available in the top
right corner of the page. The drop-down allows the user to choose between 3 different 
scenes (not counting the default void):
- **glitchedBakery** - a bakery lost somewhere in the matrix 
- **prisonCell** - a creepy dark prison cell
- **space** - in the middle of space, with the company of some foreigners and of the 
planets in the surroundings

The web interface can also be used to change the camera view. You can either play the 
game in a free camera view, where the camera position and angle can be changed with the
mouse, or in a fixed view called "playerView" (advised), where the camera is locked and
a button can be used to change from one player's perspective to the other's.

### 3D Clickable objects menu

The checkers-board contains a section with the score, a timer and multiple clickable
buttons that allow the user to access a multitude of functionalities:
- Undo the last action
- Reset the Game
- Change the camera angle (in case of fixed camera) to the other player's view
- Show a replay of the current game