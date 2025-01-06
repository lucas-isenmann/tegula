import { AXES, GamepadWrapper } from "gamepad-wrapper";
import { Tile, World } from "./world";
import { colors } from "./colors";


export class Player {
    name: string;
    id: number;
    colorNb: number;
    gamepad: GamepadWrapper;
    svg: SVGElement;
    x: number;
    y: number;
    world: World;
    speed: number;
    tile: undefined | Tile;
    points: number;
    pointsSvg: SVGElement;

    constructor(gamepad: GamepadWrapper, world: World, nbPlayers: number){
        this.name = Math.random().toString();
        this.id = Math.floor(Math.random()*10000);
        this.colorNb = Math.floor(1+Math.random()*(colors.length-1));
        this.gamepad = gamepad;
        this.x = 100+Math.random()*50;
        this.y = 100+Math.random()*50;
        this.world = world;
        this.speed = 5;
        this.points = 0;

        // this.svg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        // this.svg.setAttribute("x", this.x.toString());
        // this.svg.setAttribute("y", this.y.toString());
        // this.svg.setAttribute("width", `10`);
        // this.svg.setAttribute("height", `10`);
        // this.svg.setAttribute("fill", colors[this.colorNb]);
        // world.svg.appendChild(this.svg);

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.svg.setAttribute("position", "relative")
        this.svg.setAttribute("cx", this.x.toString());
        this.svg.setAttribute("cy", this.y.toString());
        this.svg.setAttribute("z-index", "100");
        this.svg.setAttribute("r", "5"); 
        this.svg.setAttribute("fill", colors[this.colorNb]);
        this.svg.setAttribute("stroke", "black")
        world.svg.appendChild(this.svg);

        const pointsX = this.world.m*this.world.size + 40;
        const pointsY = 500 + 30*nbPlayers;
        const pointsSvg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        pointsSvg.setAttribute("x", pointsX.toString());
        pointsSvg.setAttribute("y", pointsY.toString());
        pointsSvg.setAttribute("width", "80");
        pointsSvg.setAttribute("height", "30");
        pointsSvg.setAttribute("fill", colors[this.colorNb]);
        world.svg.appendChild(pointsSvg);


        const pointsText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        pointsText.setAttribute("font-size", "24")
        pointsText.setAttribute("x", pointsX.toString());
        pointsText.setAttribute("y", (pointsY+20).toString());
        pointsText.setAttribute("fill", "black");
        pointsText.textContent = this.points.toString()
        world.svg.appendChild(pointsText)
        this.pointsSvg = pointsText;


        console.log("new player", this.id)
    }

    updatePoints(add: number){
        this.points += add;
        this.pointsSvg.textContent = this.points.toString();
    }

    cancel(){
        if (typeof this.tile != "undefined"){
            this.tile.svg.remove();
            this.tile = undefined;
            this.updatePoints(-1);
        }
    }

    put(){
        // If Player has no tile
        if (typeof this.tile == "undefined"){
            for (const [tileId, tile] of this.world.tiles){
                if (tile.containsPoint (this.x, this.y)){
                    console.log("Player clicked on tile");
                    tile.colorTile(this.colorNb);
                    tile.setOK(this.colorNb);
                    this.tile = tile;
                    this.world.removeTile(tile.id);
                    this.world.addRandomTile()

                    return;
                }
    
            }
        } 
        // Otherwise try to put tile
        else {
            const result = this.world.tryPut(this.tile, this.x, this.y, this.colorNb, this.id);
            if (typeof result == "number"){
                this.updatePoints(result)
                this.tile = undefined;
            }
            
            
        }

        

        return;
        // OLD
        for (const square of this.world.squares){
            const squareX = Number(square.rect.getAttribute("x"));
            const squareY = Number(square.rect.getAttribute("y"));

            // Check if the player's position is within the square
            if (
                this.x <= squareX + this.world.size &&
                squareX <= this.x  &&
                this.y <= squareY + this.world.size &&
                squareY <= this.y
            ) {
                // Change the color of the square to match the player's color
                square.rect.setAttribute("fill", colors[this.colorNb]);
            }
        }
    }

    rotate(){
        if (typeof this.tile != "undefined"){
            this.tile.rotate();
            this.updateTilePos();
        }
    }

    updateTilePos(){
        if (typeof this.tile != "undefined"){
            if (this.world.canPut(this.tile, this.x, this.y, this.colorNb, this.id)){
                this.tile.setOK(this.colorNb)
            } else {
                this.tile.setBAD(this.colorNb)
            }

            const [i,j] = this.world.getCoord(this.x, this.y);
            const nx = i*this.world.size;
            const ny = j*this.world.size;

            this.tile.svg.setAttribute("x", nx.toString());
            this.tile.svg.setAttribute("y", ny.toString());
        }
    }

    moveUp(d: number): void {
        this.y -= d;
        this.svg.setAttribute("cy", this.y.toString());
        this.updateTilePos()
    }

    moveDown(d: number): void {
        this.y += d;
        this.svg.setAttribute("cy", this.y.toString());
        this.updateTilePos()

    }

    moveLeft(d: number): void {
        this.x -= d;
        this.svg.setAttribute("cx", this.x.toString());
        this.updateTilePos()

    }

    moveRight(d: number): void {
        this.x += d;
        this.svg.setAttribute("cx", this.x.toString());
        this.updateTilePos()

    }

    updatePosition(): void {
        const axisLeftX = this.gamepad.getAxis(
            AXES.STANDARD.THUMBSTICK_LEFT_X,
        );
        if (axisLeftX < -0.2){
            this.moveLeft(-axisLeftX * this.speed);
        }
        if (axisLeftX > 0.2){
            this.moveRight(axisLeftX * this.speed);
        }

        const axisLeftY = this.gamepad.getAxis(
            AXES.STANDARD.THUMBSTICK_LEFT_Y,
        );
        if (axisLeftY < -0.2){
            this.moveUp(-axisLeftY * this.speed);
        }
        if (axisLeftY > 0.2){
            this.moveDown(axisLeftY * this.speed);
        }
        
    }
}