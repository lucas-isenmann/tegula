import { colors } from "./colors";
import { shapes } from "./shapes";

class Square {
    rect: SVGRectElement;
    x: number;
    y: number;
    size: number;
    i: number;
    j: number;
    playerId: number | undefined;
    bonus: number;
    animation: undefined | Animation;

    constructor(i: number, j: number, size: number, color: number){
        this.x = j*size;
        this.y = i*size;
        this.i = i;
        this.j = j;
        this.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.rect.setAttribute("x", this.x.toString());
        this.rect.setAttribute("y", this.y.toString());
        this.rect.setAttribute("z-index", "-1")
        this.rect.setAttribute("width", `${size}`);
        this.rect.setAttribute("height", `${size}`);
        this.playerId = undefined;
        this.bonus = 0;

        this.rect.setAttribute("fill", colors[color]);
        this.size = size;

        
    }

    ownedBy(playerId: number){
        if (typeof this.playerId == "undefined"){
            return false;
        } else {
            return this.playerId == playerId;
        }
    }

    containsPoint(x: number, y: number): boolean{
        return x <= this.x + this.size &&
                this.x <= x  &&
                y <= this.y + this.size &&
                this.y <= y
    }

    setColor(color: number){
        
        this.rect.setAttribute("fill", colors[color]);
    }

    addBonus(value: number){
        this.bonus = value;

        const aliceTumbling = [
            { fill: '#004545'},
            { fill: "#454545" },
            { fill: '#004545'}
        ]
        
        const aliceTiming = {
            duration: 500,
            easing: 'ease-in-out',
            iterations: Infinity,
        }
        
        this.animation = this.rect.animate(
            aliceTumbling, 
            aliceTiming
        )
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
            square.rect.setAttribute("fill", colors[color]);
        }
    }

    setOK(color: number) {
        this.color = color;
        for (const square of this.squares) {
            square.rect.setAttribute('fill-opacity', '0');
            square.rect.setAttribute('stroke', colors[color]);
            square.rect.setAttribute('stroke-width', '2');
            square.rect.removeAttribute('stroke-dasharray');
        }
    }

    setBAD(color: number) {
        this.color = color;
        for (const square of this.squares) {
            square.rect.setAttribute('fill-opacity', '0');
            square.rect.setAttribute('stroke', colors[color]);
            square.rect.setAttribute('stroke-width', '2');
            square.rect.setAttribute('stroke-dasharray', '3, 6'); // Adjust as needed
        }
    }

    rotate(){
        console.log("rotate")

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
   
    matrix: Array<Array<number>>;
    squares: Array<Square>;
    n: number;
    m: number;
    size: number;
    svg: SVGSVGElement;
    tiles: Map<number, Tile>;
    tilesStack: Array<number>;

    constructor(n: number, m: number, tilesNb: number){


        this.size = Math.floor( window.innerHeight/n );
        this.matrix = new Array(n);
        this.n = n;
        this.m = m;
        this.squares = new Array();
        this.tiles = new Map();
        this.tilesStack = new Array();


        for (let i = 0; i < n; i ++){
            this.matrix[i] = new Array(m);
            for (let j = 0; j < n ; j ++){
                this.matrix[i][j] = Math.floor(Math.random()*1);
            }
        }

        this.svg = this.initSvg()

        for (let i= 0; i < tilesNb; i ++){
            this.tilesStack.push(-1);
            this.addRandomTile();
        }

        for (let i = 0; i < 5; i ++){
            this.addRandomBonus();
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

    initSvg(): SVGSVGElement{
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("position", "relative")
        svg.setAttribute("width", window.innerWidth.toString());
        svg.setAttribute("height", window.innerHeight.toString());

        window.addEventListener("resize", () => {
            svg.setAttribute("width", window.innerWidth.toString());
            svg.setAttribute("height", window.innerHeight.toString());
        });


        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                const square = new Square(i,j, this.size, this.matrix[i][j]);
                this.squares.push(square);
                svg.appendChild(square.rect);
            }
        }
    
        document.body.appendChild(svg);
        return svg;
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

                const x =  this.n*this.size + 10;
                tile.svg.setAttribute("x", x.toString())
                const y = 30 + i * 100;
                tile.svg.setAttribute("y", y.toString())
                this.tiles.set(tile.id, tile);
                this.svg.appendChild(tile.svg);

            }
        }

        
    }

    isThereStartColor(color: number){
        for (const square of this.squares){
            if (square.rect.getAttribute("fill") == colors[color]){
                return true;
            }
        }
        return false;
    }

    canPut(tile: Tile, x: number, y: number, color: number, playerId: number): boolean {
        const [i,j] = this.getCoord(x,y);

        const hasStart = this.isThereStartColor(color);
        let isAdj = false;

        for (const [b,a] of tile.pixelsList){
            if (typeof this.squares[i+a+this.m*(j+b)].playerId != "undefined") {
                return false
            }

            if (hasStart && isAdj == false){
                if (i+a+1 < this.n &&
                    j+b+1 < this.m &&
                    this.squares[i+a+1+this.m*(j+b+1)].ownedBy(playerId)
                    ) {
                    isAdj = true;
                } 
                if (i+a-1 >= 0 &&
                    j+b+1 < this.m &&
                    this.squares[i+a-1+this.m*(j+b+1)].ownedBy(playerId)
                    ) {
                    isAdj = true;
                }
                if (i+a-1 >= 0 &&
                    j+b-1 >= 0 &&
                    this.squares[i+a-1+this.m*(j+b-1)].ownedBy(playerId)
                    ) {
                    isAdj = true;
                }
                if (i+a+1 < this.n &&
                    j+b-1 >= 0 &&
                    this.squares[i+a+1+this.m*(j+b-1)].ownedBy(playerId)
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
        const [i,j] = this.getCoord(x,y);

        this.destroy( [
        [i-1,j-1],[i,j-1],[i+1,j-1],
        [i-1,j],[i,j],[i+1,j],
        [i-1,j+1],[i,j+1],[i+1,j+1]])
    }

    destroy( list: Array<[number, number]>){
        for ( const [i,j] of list){
            if (0 <= i && i <= this.n && 0 <= j && j <= this.m){
                const square = this.squares[i+ this.m*j];
                square.playerId = undefined;
                const color = square.rect.getAttribute("fill")
                if (color != null){
                    square.animate(color, "gray")

                }
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
        if (this.canPut(tile, x, y, color, playerId)){
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
    

            this.removeTile(tile.id);
            tile.svg.remove();
    
            return points ;
        }
        return undefined;
    }

}


