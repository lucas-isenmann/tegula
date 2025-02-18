import { AXES, GamepadWrapper, BUTTONS } from "gamepad-wrapper";
import { Tile, World } from "./world";
import { colors } from "./colors";



export class Player {
    name: string;
    id: number;
    colorNb: number;
    gamepad: GamepadWrapper | undefined;
    svg: SVGElement;
    x: number;
    y: number;
    world: World;
    speed: number;
    tile: undefined | Tile;
    points: number;
    scoreDiv: HTMLDivElement;
    nbBombs: number;
    bombDivs: Array<HTMLDivElement>;
    pointsDiv: HTMLDivElement;
    keyUsed: string;
    bombZone: SVGElement;
    loadBomb: boolean = false;

    constructor(gamepad: GamepadWrapper | undefined, world: World, nbPlayers: number, colorNb: number){
        this.name = Math.random().toString();
        this.id = Math.floor(Math.random()*10000);
        this.colorNb = colorNb; // Math.floor(1+Math.random()*(colors.length-1));
        this.gamepad = gamepad;
        this.x = 100+Math.random()*50;
        this.y = 100+Math.random()*50;
        this.world = world;
        this.speed = 5;
        this.points = 0;
        this.nbBombs = 3;
        this.keyUsed = "";

        // Bomb Zone
        this.bombZone = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.bombZone.setAttribute("href", "img/bomb_zone.svg");
        this.bombZone.setAttribute("x", this.x.toString());
        this.bombZone.setAttribute("y", this.y.toString());
        this.bombZone.setAttribute("width", (3*this.world.size).toString());
        this.bombZone.setAttribute("height", (3*this.world.size).toString());
        // this.bombZone.setAttribute("fill", "red");
        this.bombZone.setAttribute("opacity", "0");
        world.svg.appendChild(this.bombZone);
        

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
        this.svg.setAttribute("r", "6"); 
        this.svg.setAttribute("fill", colors[this.colorNb]);
        this.svg.setAttribute("stroke", "black")
        world.svg.appendChild(this.svg);


        const scoreDiv = document.createElement("div");
        scoreDiv.classList.add("score")
        scoreDiv.style.backgroundColor = colors[this.colorNb];
        world.scoresDiv.appendChild(scoreDiv);
        this.scoreDiv = scoreDiv;

        const pointsDiv = document.createElement("div");
        pointsDiv.textContent = this.points.toString();
        this.scoreDiv.appendChild(pointsDiv)
        this.pointsDiv = pointsDiv;

        const bombDiv = document.createElement("div");
        this.bombDivs = [];
        for (let i = 0; i < this.nbBombs; i ++){
            const img = document.createElement("div");
            img.classList.add("bomb");
            // img.src = "img/bomb.png"
            bombDiv.appendChild(img);
            this.bombDivs.push(img);
        }
        this.scoreDiv.appendChild(bombDiv)

        // const pointsX = this.world.m*this.world.size + 40;
        // const pointsY = 500 + 30*nbPlayers;
        // const pointsX = 0;
        // const pointsY = 0;

        // const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // svg.setAttribute("position", "relative")
        // world.scoresDiv.appendChild(svg);

        // const pointsSvg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        // pointsSvg.setAttribute("x", pointsX.toString());
        // pointsSvg.setAttribute("y", pointsY.toString());
        // pointsSvg.setAttribute("width", "80");
        // pointsSvg.setAttribute("height", "30");
        // pointsSvg.setAttribute("fill", colors[this.colorNb]);
        // svg.appendChild(pointsSvg)
        // // world.svg.appendChild(pointsSvg);


        const pointsText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        // pointsText.setAttribute("font-size", "24")
        // pointsText.setAttribute("x", pointsX.toString());
        // pointsText.setAttribute("y", (pointsY+20).toString());
        // pointsText.setAttribute("fill", "black");
        // pointsText.textContent = this.points.toString()
        // svg.appendChild(pointsText)
        // // world.svg.appendChild(pointsText)
        // this.pointsSvg = pointsText;


        console.log("new player", this.id)
    }

    updatePoints(add: number){
        this.points += add;
        this.pointsDiv.textContent = this.points.toString();
    }

    cancel(){
        if (typeof this.tile != "undefined"){
            this.tile.svg.remove();
            this.tile = undefined;
            this.updatePoints(-1);
        }
    }


    askExplode(){
        if (this.nbBombs > 0){
            this.bombDivs[this.nbBombs-1].remove();
            this.world.destroyBomb(this.x, this.y);
            this.nbBombs -= 1;
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
                    this.world.addRandomTile();

                    this.world.tilesStackGroup.removeChild(tile.svg);
                    this.world.selectedTilesGroup.appendChild(tile.svg);
                    

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

    flip(){
        if (typeof this.tile != "undefined"){
            this.tile.flip();
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

        const [i,j] = this.world.getCoord(this.x, this.y);
        const nx = (i-1)*this.world.size;
        const ny = (j-1)*this.world.size;
        this.bombZone.setAttribute("x", nx.toString());
        this.bombZone.setAttribute("y", ny.toString());
    }

    moveUp(d: number): void {
        if (this.y -d >= 0){
            this.y -= d;
            this.svg.setAttribute("cy", this.y.toString());
            this.updateTilePos()
        }
    }

    moveDown(d: number): void {
        if (this.y +d < this.world.size*(this.world.n+1/2) ){
            this.y += d;
            this.svg.setAttribute("cy", this.y.toString());
            this.updateTilePos()
        }
    }

    moveLeft(d: number): void {
        if (this.x -d >= 0){
            this.x -= d;
            this.svg.setAttribute("cx", this.x.toString());
            this.updateTilePos()
        }
    }

    moveRight(d: number): void {
        this.x += d;
        this.svg.setAttribute("cx", this.x.toString());
        this.updateTilePos()

    }


    checkEvent(): void {
        if (typeof this.gamepad != "undefined"){
            this.gamepad.update();
            if (this.gamepad.getButtonDown(BUTTONS.STANDARD.RC_BOTTOM) ){ // A
                this.put()
            }

            if (this.gamepad.getButtonDown(BUTTONS.STANDARD.RC_TOP) ){ //X
                this.rotate()
            } else if ( this.gamepad.getButtonDown(BUTTONS.STANDARD.BUMPER_LEFT) ){
                this.flip()
            }

            if (this.gamepad.getButtonDown(BUTTONS.STANDARD.RC_RIGHT) ){ //B
                this.cancel()
            }

            if (this.gamepad.getButtonDown(BUTTONS.STANDARD.RC_LEFT) ){ //Y
                this.askExplode();
            }



            if (this.gamepad.getButton(BUTTONS.STANDARD.LC_BOTTOM) ){
                this.moveUp(2);
            }

            if (this.gamepad.getButton(BUTTONS.STANDARD.LC_TOP) ){
                this.moveRight(2);
            }

            if (this.gamepad.getButton(BUTTONS.STANDARD.LC_RIGHT) ){
                this.moveDown(2);
            }

            if (this.gamepad.getButton(BUTTONS.STANDARD.LC_LEFT) ){
                this.moveLeft(2);
            }


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
        else {
            if (this.world.keysPressed.has("d")){
                this.moveRight( this.speed);
            }
            if (this.world.keysPressed.has("q")){
                this.moveLeft( this.speed);
            }
            if (this.world.keysPressed.has("z")){
                this.moveUp( this.speed);
            }
            if (this.world.keysPressed.has("s")){
                this.moveDown( this.speed);
            }
            if (this.world.keysPressed.has(" ") ){ // A
                this.put()
            }
            if (this.world.keysPressed.has("e") ){ //X
                if (this.keyUsed == ""){
                    this.rotate()
                    this.keyUsed = "e";
                }
            }
            
            else {
                if (this.keyUsed == "e"){
                    this.keyUsed = "";
                }
            }

            // Flip
            if (this.world.keysPressed.has("f") ){ 
                if (this.keyUsed == ""){
                    this.flip()
                    this.keyUsed = "f";
                }
            }
            else if (this.keyUsed == "f"){
                    this.keyUsed = "";
            }

            if ( this.world.keysPressed.has("a") ){ //B
                this.cancel()
            }

            // Ask bomb
            if ( this.world.keysPressed.has("x") ){ //B
                if (this.keyUsed == ""){
                    this.keyUsed = "x";
                    if (this.loadBomb){
                        this.askExplode()
                        this.loadBomb = false;
                        this.bombZone.setAttribute("opacity", "0")
                    } else {
                        this.loadBomb = true;
                        this.bombZone.setAttribute("opacity", "0.5")
                    }
                    
                    
                }
                
            }
            else {
                if (this.keyUsed == "x"){
                    this.keyUsed = "";
                }
            }
        }

    }



    
}