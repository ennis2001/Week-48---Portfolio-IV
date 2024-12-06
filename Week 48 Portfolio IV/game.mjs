import Labyrinth from "./labyrint.mjs";
import ANSI from "./utils/ANSI.mjs";
import SplashScreen from "./splashScreen.mjs";
import fs from 'fs';  // Import file system module to load levels from files

const REFRESH_RATE = 250;

console.log(ANSI.RESET, ANSI.CLEAR_SCREEN, ANSI.HIDE_CURSOR);

let intervalID = null;
let isBlocked = false;
let state = null;
let splash = null;

function showSplashScreen() {
    splash = new SplashScreen();
    splash.update(); // Update the splash screen once before drawing
    splash.draw();   // Draw the splash screen immediately

    // After splash screen duration, start the game
    setTimeout(() => {
        startGame();  // Start the game after splash screen duration
    }, splash.duration);  // Use the duration defined in SplashScreen
}

function loadLevel(levelId) {
    // Example of loading a level by its ID
    const levelFile = `./levels/${levelId}.txt`;  // Assuming levels are stored in the 'levels' folder
    try {
        const levelData = fs.readFileSync(levelFile, 'utf8');  // Read the level file
        const map = levelData.split('\n');  // Split the data into rows (map grid)
        const playerPosition = { x: 0, y: 0 };
        return { map, playerPosition };
    } catch (err) {
        console.error(`Failed to load level ${levelId}:`, err);
        return { map: [], playerPosition: { x: 0, y: 0 } };  // Default empty level on error
    }
}

function startGame() {
    const levelId = "start";
    const { map, playerPosition } = loadLevel(levelId); // Load the level

    state = new Labyrinth(map, playerPosition); // Pass the map and player position
    intervalID = setInterval(update, REFRESH_RATE);
}

function update() {
    if (isBlocked) return;
    isBlocked = true;

    //#region core game loop
    state.update(); // Update game state
    state.draw();   // Render the game
    //#endregion

    isBlocked = false;
}

// Start the application with the splash screen
showSplashScreen();
