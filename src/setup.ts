import { Player } from "./player";
import { World } from "./world";
import { GamepadWrapper, BUTTONS, AXES } from 'gamepad-wrapper';



function setup(){
    
    const world = new World(20, 20, 3);
    const players = new Array<Player>();

    let gamepadWrapper: GamepadWrapper;

    window.addEventListener('gamepadconnected', (event) => {
        console.log("gamepad connected")
        gamepadWrapper = new GamepadWrapper(event.gamepad);
        players.push(new Player(gamepadWrapper, world, players.length))

    });

    function gameLoop() {

        for (const player of players){
            player.gamepad.update();
            if (player.gamepad.getButtonDown(BUTTONS.STANDARD.RC_BOTTOM) ){ // A
                player.put()
            }

            if (player.gamepad.getButtonDown(BUTTONS.STANDARD.RC_TOP) ){ //X
                player.rotate()
            }

            if (player.gamepad.getButtonDown(BUTTONS.STANDARD.RC_RIGHT) ){ //B
                player.cancel()
            }

            if (player.gamepad.getButtonDown(BUTTONS.STANDARD.RC_LEFT) ){ //Y
                console.log("y")
                world.destroyBomb(player.x, player.y);
            }



            if (player.gamepad.getButton(BUTTONS.STANDARD.LC_BOTTOM) ){
                player.moveUp(2);
            }

            if (player.gamepad.getButton(BUTTONS.STANDARD.LC_TOP) ){
                player.moveRight(2);
            }

            if (player.gamepad.getButton(BUTTONS.STANDARD.LC_RIGHT) ){
                player.moveDown(2);
            }

            if (player.gamepad.getButton(BUTTONS.STANDARD.LC_LEFT) ){
                player.moveLeft(2);
            }

            player.updatePosition()
        }

    }
    
      setInterval(gameLoop, 16); // 60 FPS
    


}

setup()