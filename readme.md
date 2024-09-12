# Vite base project for HTML/Typescript

Init a vite project with an index.html a style.css and a setup.ts.

## Usage

Clone this repo.
Launch the vite dev environment:

    npm run dev

Put the typescripts file in src/.
Put all static files in public/.


## Summary of the initialisation


    npm init
    npm install vite --save-dev
    mkdir public
    mkdir public/css
    mkdir src
    touch index.html
    touch src/setup.ts
    touch public/css/style.css
    touch .gitignore


Replace scripts by the following to package.json:

"scripts": {
    "dev": "vite dev",
    "build": "vite build"
},