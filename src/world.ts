import { bombSFX, timerAudio } from "./audio";
import { colors } from "./colors";
import { shapes } from "./shapes";

const ENDTIME = 60;






class Square {
    rect: SVGImageElement;
    bonusImg: SVGElement;
    x: number;
    y: number;
    size: number;
    i: number;
    j: number;
    playerId: number;
    bonus: number;
    animation: undefined | Animation;

    constructor(i: number, j: number, size: number, color: number){
        this.x = j*size;
        this.y = i*size;
        this.i = i;
        this.j = j;

        this.rect = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.rect.setAttribute("href", "img/tile_neutral.svg");
        this.rect.setAttribute("x", this.x.toString());
        this.rect.setAttribute("y", this.y.toString());
        this.rect.setAttribute("z-index", "-1")
        this.rect.setAttribute("width", `${size}`);
        this.rect.setAttribute("height", `${size}`);
        this.playerId = 0;
        this.bonus = 0;

        


        this.bonusImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.size = size;
    }

    reset(){
        this.bonus = 0;
        this.setColor(0);
        this.bonusImg.remove();
        this.playerId = 0;
    }

    getOwner(){
        return this.playerId;
    }



    containsPoint(x: number, y: number): boolean{
        return x <= this.x + this.size &&
                this.x <= x  &&
                y <= this.y + this.size &&
                this.y <= y
    }

    setImpossible(color: number){
        if (color == 1){
            this.rect.setAttribute("href", "img/tile_blue_impossible.svg");
        }
        if (color == 2){
            this.rect.setAttribute("href", "img/tile_pink_impossible.svg");
        }
        if (color == 3){
            this.rect.setAttribute("href", "img/tile_green_impossible.svg");
        }
        if (color == 4){
            this.rect.setAttribute("href", "img/tile_orange_impossible.svg");
        }

    }

    setColor(color: number){
        this.playerId = color;
        if (color == 1){
            this.rect.setAttribute("href", "img/tile_blue.svg");
        } else if (color == 2){
            this.rect.setAttribute("href", "img/tile_pink.svg");
        } else if (color == 3){
            this.rect.setAttribute("href", "img/tile_green.svg");
        } else if (color == 4){
            this.rect.setAttribute("href", "img/tile_orange.svg");
        }else {
            this.rect.setAttribute("href", "img/tile_neutral.svg");
        }
        // this.rect.setAttribute("fill", colors[color]);
    }

    addBonus(value: number){
        this.bonus = value;

        // this.rect.setAttribute("fill", "#00ff0000");
            // this.rect.classList.add("bonus")
        this.bonusImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.bonusImg.setAttribute("href", "img/star2.svg");
        this.bonusImg.setAttribute("x", this.x.toString());
        this.bonusImg.setAttribute("y", this.y.toString());
        this.bonusImg.setAttribute("width", this.size.toString());
        this.bonusImg.setAttribute("height", this.size.toString());
        this.rect.parentNode.appendChild(this.bonusImg);
        

        // const aliceTumbling = [
        //     { fill: '#000000'},
        //     { fill: "#330033" },
        //     { fill: '#000000'}
        // ]
        
        // const aliceTiming = {
        //     duration: 500,
        //     easing: 'ease-in-out',
        //     iterations: Infinity,
        // }
        
        // this.animation = this.rect.animate(
        //     aliceTumbling, 
        //     aliceTiming
        // )
    }

    animate(srcColor: string, destColor: string){
        const aliceTumbling = [
            { fill: srcColor},
            { fill: destColor }
        ]
        
        const aliceTiming = {
            duration: 500,
            easing: 'ease-in-out',
            iterations: 1,
        }
        
        this.rect.animate(
            aliceTumbling, 
            aliceTiming
        )

       
    }

}

export class Tile {
    id: number;
    svg: SVGElement;
    squares: Array<Square>;
    pixelsList: Array<[number, number]>;
    size: number;
    color: number;

    constructor(id: number, l: Array<[number, number]>, size: number) {
        this.id = id;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("position", "relative");
        this.svg.setAttribute("width", `300`);
        this.svg.setAttribute("height", `300`);
        this.svg.setAttribute("z-index", "-3")
        this.pixelsList = l;
        this.size = size;
        this.color = 0;

        this.squares = new Array();

        for (const [x,y] of l){
            const square = new Square(x,y,size, this.color);
            this.svg.appendChild(square.rect);
            this.squares.push(square);
        }
    }

    containsPoint(x: number, y: number){
        const svgX = Number(this.svg.getAttribute("x"));
        const svgY = Number(this.svg.getAttribute("y"));

        for (const square of this.squares){
            if ( square.containsPoint(x-svgX, y-svgY)){
                return true;
            }
        }
        return false;
    }

    colorTile(color: number){
        this.color = color;
        for (const square of this.squares){
            square.setColor(color);
        }
    }

    setOK(color: number) {
        this.color = color;
        for (const square of this.squares) {
            square.setColor(color);
            // square.rect.setAttribute('fill-opacity', '0');
            // square.rect.setAttribute('stroke', colors[color]);
            // square.rect.setAttribute('stroke-width', '10');
            // square.rect.removeAttribute('stroke-dasharray');
        }
    }

    setBAD(color: number) {
        this.color = color;
        for (const square of this.squares) {
            square.setImpossible(color);
            // square.rect.setAttribute('fill-opacity', '0.25');
            // square.rect.setAttribute('stroke', colors[color]);
            // square.rect.setAttribute('stroke-width', '4');
            // square.rect.setAttribute('stroke-dasharray', '3, 6'); // Adjust as needed
        }
    }

    flip(){
        for (const square of this.squares){
            square.rect.remove();
        }
        this.squares.splice(0,this.squares.length);

        const newPixelsList = new Array<[number,number]>();

        let minx = 0;
        let miny = 0;
        for (const [x,y] of this.pixelsList){
            const newx = x;
            const newy = -y;
            newPixelsList.push([newx,newy]);
            minx = Math.min(minx, newx);
            miny = Math.min(miny, newy);
        }

        this.pixelsList = new Array();
        for (const [x,y] of newPixelsList){
            this.pixelsList.push([-minx+x, -miny+y]);
        }

        for (const [x,y] of this.pixelsList){
            const square = new Square(x,y, this.size, 0);
            this.svg.appendChild(square.rect);
            this.squares.push(square);
        }
        this.colorTile(this.color)
    }

    rotate(){
        for (const square of this.squares){
            square.rect.remove();
        }
        this.squares.splice(0,this.squares.length);

        const newPixelsList = new Array<[number,number]>();

        let minx = 0;
        let miny = 0;
        for (const [x,y] of this.pixelsList){
            newPixelsList.push([y,-x]);
            minx = Math.min(minx, y);
            miny = Math.min(miny, -x);
        }

        this.pixelsList = new Array();
        for (const [x,y] of newPixelsList){
            this.pixelsList.push([-minx+x, -miny+y]);
        }



        for (const [x,y] of this.pixelsList){
            const square = new Square(x,y, this.size, 0);
            this.svg.appendChild(square.rect);
            this.squares.push(square);
        }
        this.colorTile(this.color)
    }
}


export class World {
   
    squares: Array<Square>;
    n: number;
    m: number;
    size: number;
    svg: SVGSVGElement;
    scoresDiv: HTMLDivElement;
    tilesStackGroup: SVGElement;
    tiles: Map<number, Tile>;
    tilesStack: Array<number>;
    selectedTilesGroup: SVGElement;
    keysPressed: Set<string>;
    lastOperation: number;
    timerDiv: HTMLDivElement;
    over: boolean = false;

    constructor(n: number, m: number, tilesNb: number){


        this.size = Math.floor( (window.innerHeight-80) /n );
        this.n = n;
        this.m = m;
        this.squares = new Array();
        this.tiles = new Map();
        this.tilesStack = new Array();
        this.scoresDiv = document.createElement("div");
        this.scoresDiv.id = "scores"
        document.body.appendChild(this.scoresDiv);
        this.keysPressed = new Set();

        // Timer div
        this.lastOperation = Date.now();
        this.timerDiv = document.createElement("div");
        this.timerDiv.id = "timer";
        this.timerDiv.innerHTML = ""

        document.body.appendChild(this.timerDiv);



        

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.tilesStackGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.selectedTilesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        this.initSvg();
        

        for (let i= 0; i < tilesNb; i ++){
            this.tilesStack.push(-1);
            this.addRandomTile();
        }

        for (let i = 0; i < 10; i ++){
            this.addRandomBonus();
        }

        const world = this;
        setInterval(() => {
            world.updateTimer()
        }, 1000);

    }

    restart(){
        this.over = false;
        this.lastOperation = Date.now();

        for (const square of this.squares){
            square.reset()
        }

        for (let i = 0; i < 10; i ++){
            this.addRandomBonus();
        }
    }

    updateTimer(){
        const delta = ( Math.floor((Date.now() - this.lastOperation)/1000 ));
        const t = ENDTIME - delta;
        if (t <= 0){
            this.timerDiv.innerHTML = "END";
            this.over = true;
        } else if ( t < 10){
            timerAudio.play();
            this.timerDiv.innerHTML = t.toString();
        } else {
            this.timerDiv.innerHTML = ""
        }
    }


    addRandomBonus(){
        const coords = new Array<Square>();
        for (const square of this.squares){
            if ( square.bonus == 0){
                coords.push(square);
            }
        }

        const square = coords[Math.floor(Math.random()*coords.length)];
        square.addBonus(5);
    }

    initSvg(){
        this.svg.setAttribute("position", "relative")
        this.svg.setAttribute("width", window.innerWidth.toString());
        this.svg.setAttribute("height", window.innerHeight.toString());

        window.addEventListener("resize", () => {
            this.svg.setAttribute("width", window.innerWidth.toString());
            this.svg.setAttribute("height", window.innerHeight.toString());
        });



        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                const square = new Square(i,j, this.size, 0);
                this.squares.push(square);
                this.svg.appendChild(square.rect);
            }
        }

        this.svg.appendChild(this.tilesStackGroup);
        this.svg.appendChild(this.selectedTilesGroup);

    
        document.body.appendChild(this.svg);
    }

    getCoord(x: number, y: number){
        return [ Math.floor(x/ this.size), Math.floor(y/this.size)]
    }

    colorSquare(i: number, j: number, color: number){
        this.squares
    }

    addRandomTile(){
        const tile = new Tile(Math.floor(Math.random()*1000), shapes[Math.floor(Math.random()*shapes.length)], this.size);
        
        for( let i = 0; i < this.tilesStack.length; i ++){
            if (this.tilesStack[i] == -1){
                this.tilesStack[i] = tile.id;

                const x =  this.n*this.size + this.size*2;
                tile.svg.setAttribute("x", x.toString())
                const y = 30 + i * this.size*4;
                tile.svg.setAttribute("y", y.toString())
                this.tiles.set(tile.id, tile);
                this.tilesStackGroup.appendChild(tile.svg);

            }
        }

        
    }

    isThereStartColor(color: number){
        for (const square of this.squares){
            if (square.getOwner() == color){
                return true;
            }
        }
        return false;
    }

    canPut(tile: Tile, x: number, y: number, color: number, playerId: number): boolean {
        if (this.over) return false;

        const [i,j] = this.getCoord(x,y);

        const hasStart = this.isThereStartColor(color);
        console.log(`has start: ${hasStart}`)
        let isAdj = false;

        for (const [b,a] of tile.pixelsList){
            if ( (i+a < this.n && 0 <= i+a && j+b < this.m && 0<= j+b) == false){
                console.log("out of grid")
                return false;
            }
            if (this.squares[i+a+this.m*(j+b)].playerId != 0) {
                console.log(`square ${i+a} ${j+b} already controlled by `, this.squares[i+a+this.m*(j+b)].playerId)
                return false
            }

            if (isAdj == false){
                if (i+a+1 < this.n &&
                    j+b+1 < this.m &&
                    this.squares[i+a+1+this.m*(j+b+1)].getOwner() == playerId
                    ) {
                    isAdj = true;
                } 
                if (i+a-1 >= 0 &&
                    j+b+1 < this.m &&
                    this.squares[i+a-1+this.m*(j+b+1)].getOwner() == playerId
                    ) {
                    isAdj = true;
                }
                if (i+a-1 >= 0 &&
                    j+b-1 >= 0 &&
                    this.squares[i+a-1+this.m*(j+b-1)].getOwner() == playerId
                    ) {
                    isAdj = true;
                }
                if (i+a+1 < this.n &&
                    j+b-1 >= 0 &&
                    this.squares[i+a+1+this.m*(j+b-1)].getOwner() == playerId
                    ) {
                    isAdj = true;
                }
            }


            if (i+a+1 < this.n && this.squares[i+a+1+this.m*(j+b)].playerId == playerId) {
                return false;
            }
            if (i+a-1 >= 0 && this.squares[i+a-1+this.m*(j+b)].playerId == playerId) {
                return false;
            }
            if (j+b+1 < this.m && this.squares[i+a+this.m*(j+b+1)].playerId == playerId) {
                return false;
            }
            if (j+b-1 >= 0 && this.squares[i+a+this.m*(j+b-1)].playerId == playerId) {
                return false;
            }
        }

        if (hasStart && isAdj == false){
            return false;
        }

        return true;

    }

    destroyBomb( x: number, y: number){
        if (this.over) return false;
        const [i,j] = this.getCoord(x,y);

        bombSFX.play();
        this.lastOperation = Date.now();

        this.destroy( [
        [i-1,j-1],[i,j-1],[i+1,j-1],
        [i-1,j],[i,j],[i+1,j],
        [i-1,j+1],[i,j+1],[i+1,j+1]])
    }

    destroy( list: Array<[number, number]>){
        if (this.over) return false;
        for ( const [i,j] of list){
            if (0 <= i && i <= this.n && 0 <= j && j <= this.m){
                const square = this.squares[i+ this.m*j];
                square.playerId = 0;
                square.setColor(0);
            }
        }
    }

    removeTile(tileId: number){
        this.tiles.delete(tileId);
        for (let i = 0; i < this.tilesStack.length; i ++){
            if ( this.tilesStack[i] == tileId){
                this.tilesStack[i] = -1;
            }
        }
    }

   
    tryPut(tile: Tile, x: number, y: number, color: number, playerId: number): number | undefined {
        if (this.over) return;

        if (this.canPut(tile, x, y, color, playerId)){
            timerAudio.play();

            const [i,j] = this.getCoord(x,y);
            let points = tile.pixelsList.length;

            for (const [b,a] of tile.pixelsList){
                const square = this.squares[i+a+this.m*(j+b)];
                points += square.bonus;
                square.playerId = playerId;
                
                if (typeof square.animation != "undefined"){
                    square.animation.cancel()
                    square.animation = undefined;
                } 
                square.setColor(color);
                square.animate("gray", colors[color]);
            }
    
            this.lastOperation = Date.now();
            this.removeTile(tile.id);
            tile.svg.remove();
    
            return points ;
        }
        return undefined;
    }

}


