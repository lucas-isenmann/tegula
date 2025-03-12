import { Player } from "./player";
import { World } from "./world";


let choice = 0;
let sizeParam = 20;

const menu = document.createElement("div");
menu.id = "menu"
document.body.appendChild(menu);

// RESUME
const resume = document.createElement("div");
resume.id = "resume"
resume.innerHTML = "RESUME"
resume.classList.add("menu-item");
resume.classList.add("choice");
menu.appendChild(resume)

resume.onclick = () => {
    turnOffMenu();
}

// RESTART
const restart = document.createElement("div");
restart.id = "restart"
restart.innerHTML = "RESTART"
restart.classList.add("menu-item");
restart.classList.add("choice");
menu.appendChild(restart)




// SIZE CHANGE

const size = document.createElement("div");
size.id = "restart"
size.innerHTML = "SIZE: 20"
size.classList.add("menu-item");
size.classList.add("choice");
menu.appendChild(size)



let choices = [resume, restart, size];
let actions: (() => any )[] = [];

actions.push( () => {
    turnOffMenu();
})


export function initMenu(world: World, players: Array<Player>){
    turnOffMenu();

    // Restart
    actions.push( () => {
        world.restart();
        for (const player of players){
            player.reset();
        }
        turnOffMenu();
    })
    restart.onclick = actions[1];

    // Size
    actions.push( () => {
        world.n = sizeParam;
        world.m = sizeParam;
    })
    size.onclick = actions[2];
}



// Meta

function updateItemSelected(){
    for (const div of choices){
        div.classList.remove("selected");
    }
    choices[choice].classList.add("selected")
}

export function previousChoice(){
    choice -= 1;
    if (choice < 0){
        choice = 0;
    }

    updateItemSelected()
}

export function menuRight(){
    if (choice == 2){
        sizeParam ++;
        size.innerHTML = `SIZE: ${sizeParam}`
    }
}

export function menuLeft(){
    if (choice == 2){
        sizeParam --;
        size.innerHTML = `SIZE: ${sizeParam}`
    }
}

export function nextChoice(){
    choice += 1;
    if (choice >= choices.length){
        choice = choices.length-1;
    }
    updateItemSelected()
}

export function validateMenuChoice(){
    if (choice == 0){
        turnOffMenu();
    } else if (choice == 1){
        actions[1]();
    }
}


export function isMenuOn(): boolean {
    return (menu.style.display == "block")
}

export function turnOnMenu(){
    menu.style.display = "block"
}


export function turnOffMenu(){
    menu.style.display = "none"
}