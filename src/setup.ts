import { colors } from "./colors";
import { Player } from "./player";
import { World } from "./world";
import { GamepadWrapper, BUTTONS, AXES } from 'gamepad-wrapper';



function setup(){
    
    const world = new World(25, 25, 5);
    const players = new Array<Player>();
    let hasKeyboardPlayer = false;

    let gamepadWrapper: GamepadWrapper;

    window.addEventListener('gamepadconnected', (event) => {
        console.log("gamepad connected")
        gamepadWrapper = new GamepadWrapper(event.gamepad);
        players.push(new Player(gamepadWrapper, world, players.length, ((1+players.length) % colors.length)))
    });

    window.addEventListener('keydown', (event: KeyboardEvent) => {
        console.log("keyboard connected")
        if (hasKeyboardPlayer == false){
            hasKeyboardPlayer = true;
            players.push(new Player(undefined, world, players.length, ((1+players.length) % colors.length)))
        }

        if (!event.repeat) {
            console.log(event.key.toLowerCase());
            world.keysPressed.add(event.key.toLowerCase());
        }
    });

    window.addEventListener('keyup', (event: KeyboardEvent) => {
            world.keysPressed.delete(event.key.toLowerCase());
    });



    function gameLoop() {

        for (const player of players){
            player.checkEvent();
        }

    }
    
      setInterval(gameLoop, 16); // 60 FPS
    


}

setup()