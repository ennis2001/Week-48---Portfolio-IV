import ANSI from "./utils/ANSI.mjs";
import KeyBoardManager from "./utils/KeyBoardManager.mjs";
import { readMapFile, readRecordFile } from "./utils/fileHelpers.mjs";
import * as CONST from "./constants.mjs";

const startingLevel = CONST.START_LEVEL_ID;
const levels = loadLevelListings();

function loadLevelListings(source = CONST.LEVEL_LISTING_FILE) {
    let data = readRecordFile(source);
    let levels = {};
    for (const item of data) {
        let keyValue = item.split(":");
        if (keyValue.length >= 2) {
            let key = keyValue[0];
            let value = keyValue[1];
            levels[key] = value;
        }
    }
    return levels;
}

let levelData = readMapFile(levels[startingLevel]);
let level = levelData;

let pallet = {
    "█": ANSI.COLOR.LIGHT_GRAY,
    "H": ANSI.COLOR.RED,
    "$": ANSI.COLOR.YELLOW,
    "B": ANSI.COLOR.GREEN,
    "D": ANSI.COLOR.CYAN,
    "♨︎": ANSI.COLOR.MAGENTA,
    "𓌏": ANSI.COLOR.BLUE,
    "🗡": ANSI.COLOR.BLUE
};

let isDirty = true;

let playerPos = {
    row: null,
    col: null,
};

// Constants for symbols
const EMPTY = " ";
const HERO = "H";
const LOOT = "$";
const DOOR = "D";
const TELEPORT = "♨︎";
const ENEMY = "X";
const AXE = "𓌏";
const SWORD = "🗡";

let direction = -1;

let items = [];

const THINGS = [LOOT, EMPTY, DOOR, TELEPORT]; // Include teleportation in valid items

let eventText = "";

const HP_MAX = 10;

const playerStats = {
    hp: 8,
    chash: 0,
};

class Labyrinth {
    constructor() {
        this.enemyPositions = this.initializeEnemyPositions(); // Store enemy positions and patrol states
    }

    initializeEnemyPositions() {
        let enemyPositions = [];
        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] === ENEMY) {
                    enemyPositions.push({
                        row,
                        col,
                        direction: { dRow: 0, dCol: 1 }, // Initial patrol direction
                        bounds: { startRow: row, startCol: Math.max(col - 2, 0), endCol: Math.min(col + 2, level[0].length - 1) }
                    });
                }
            }
        }
        return enemyPositions;
    }

    updateEnemyPositions() {
        for (const enemy of this.enemyPositions) {
            const { row, col, direction, bounds } = enemy;
            const newCol = col + direction.dCol;

            // Check if the enemy needs to reverse direction
            if (newCol < bounds.startCol || newCol > bounds.endCol || level[row][newCol] !== EMPTY) {
                enemy.direction.dCol *= -1; // Reverse direction
            } else {
                // Move the enemy
                level[row][col] = EMPTY; // Clear the current position
                level[row][col + direction.dCol] = ENEMY; // Move to the new position
                enemy.col += direction.dCol; // Update enemy's position
            }
        }
    }

    update() {
        if (playerPos.row == null || playerPos.col == null) {
            this.setPlayerStartPosition();
        }

        let drow = 0;
        let dcol = 0;

        // Handle input directions
        if (KeyBoardManager.isUpPressed()) {
            drow = -1;
        } else if (KeyBoardManager.isDownPressed()) {
            drow = 1;
        }

        if (KeyBoardManager.isLeftPressed()) {
            dcol = -1;
        } else if (KeyBoardManager.isRightPressed()) {
            dcol = 1;
        }

        let tRow = playerPos.row + drow;
        let tCol = playerPos.col + dcol;

        // Check if the new position is within bounds and is a valid item (including DOOR)
        if (tRow >= 0 && tRow < level.length && tCol >= 0 && tCol < level[0].length && THINGS.includes(level[tRow][tCol])) {
            let currentItem = level[tRow][tCol];

            if (currentItem === LOOT) {
                let loot = Math.round(Math.random() * 7) + 3;
                playerStats.chash += loot;
                eventText = `Player gained ${loot}$`;
            } else if (currentItem === DOOR) {
                const currentLevelKey = levels[startingLevel];
                let nextLevelKey;

                // Define the door transitions
                if (currentLevelKey === "map1.txt") {
                    nextLevelKey = "aSharpPlace"; // Map1 leads to sharp.txt
                } else if (currentLevelKey === "sharp.txt") {
                    nextLevelKey = "level3"; // Sharp.txt leads to level3.txt
                } else if (currentLevelKey === "level3.txt") {
                    nextLevelKey = "aSharpPlace"; // Level3 leads to sharp.txt
                }

                if (levels[nextLevelKey]) {
                    // Read the next level file
                    level = readMapFile(levels[nextLevelKey]);

                    // Locate the new "H" in the loaded map
                    let newPosition = this.findHeroPosition(level);

                    if (newPosition) {
                        // Update player's position based on the new "H"
                        playerPos.row = newPosition.row;
                        playerPos.col = newPosition.col;
                        eventText = `You have entered ${nextLevelKey}!`;
                    } else {
                        // Error handling: if no "H" found, log an error
                        throw new Error(`No hero start position ('H') found in the new level: ${nextLevelKey}`);
                    }
                } else {
                    eventText = `Door leads nowhere.`;
                }
            } else if (currentItem === TELEPORT) {
                // Handle teleportation after player moves to the teleport
                this.checkTeleport();
            }

            // Move the HERO
            level[playerPos.row][playerPos.col] = EMPTY;
            level[tRow][tCol] = HERO;

            // Update the HERO's position
            playerPos.row = tRow;
            playerPos.col = tCol;

            // Trigger redraw
            isDirty = true;
        } else {
            direction *= -1;
        }

        // Update enemy positions as part of the game loop
        this.updateEnemyPositions();
    }

    // Function to set the player position to the HERO's starting position
    setPlayerStartPosition() {
        let position = this.findHeroPosition(level);
        if (position) {
            playerPos.row = position.row;
            playerPos.col = position.col;
            console.log(`Player start position set to: (${position.row}, ${position.col})`);
        } else {
            console.error("Hero position not found on the current map.");
        }
    }

    // Function to find the hero's position in a given map
    findHeroPosition(map) {
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                if (map[row][col] === HERO) {
                    return { row, col }; // Return the position of "H"
                }
            }
        }
        return null; // Return null if no "H" is found
    }

    // Teleport logic
    checkTeleport() {
        // Find the teleport symbols in the level
        let teleportLocations = [];
    
        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] === TELEPORT) {
                    teleportLocations.push({ row, col });
                }
            }
        }
    
        if (teleportLocations.length === 2) {
            // Check if the player is standing on one of the teleport symbols
            for (let i = 0; i < teleportLocations.length; i++) {
                let currentTeleport = teleportLocations[i];
    
                if (playerPos.row === currentTeleport.row && playerPos.col === currentTeleport.col) {
                    // Teleport the player to the other teleport location
                    let otherTeleport = teleportLocations[1 - i]; // Get the other teleport symbol
    
                    // Update the map: Keep TELEPORT symbols intact
                    level[playerPos.row][playerPos.col] = TELEPORT; // Leave current teleport symbol unchanged
                    playerPos.row = otherTeleport.row; // Update player's row
                    playerPos.col = otherTeleport.col; // Update player's column
                    level[playerPos.row][playerPos.col] = HERO; // Set the new position as the player's
    
                    eventText = `You have been teleported to the other '♨︎' symbol!`;
    
                    // Trigger redraw
                    isDirty = true;
                    return; // Exit after teleporting
                }
            }
        } else {
            eventText = `Teleportation failed: Incorrect number of teleport symbols in this level.`;
        }
    }
    
    draw() {
        if (!isDirty) return;
        isDirty = false;

        console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);

        let rendering = "";

        rendering += renderHud();

        for (let row = 0; row < level.length; row++) {
            let rowRendering = "";
            for (let col = 0; col < level[row].length; col++) {
                let symbol = level[row][col];
                if (pallet[symbol] != undefined) {
                    rowRendering += pallet[symbol] + symbol + ANSI.COLOR_RESET;
                } else {
                    rowRendering += symbol;
                }
            }
            rowRendering += "\n";
            rendering += rowRendering;
        }

        console.log(rendering);
        if (eventText !== "") {
            console.log(eventText);
            eventText = "";
        }
    }
}

function renderHud() {
    let hpBar = `Life:[${ANSI.COLOR.RED + pad(playerStats.hp, "♥︎") + ANSI.COLOR_RESET}${ANSI.COLOR.LIGHT_GRAY + pad(HP_MAX - playerStats.hp, "♥︎") + ANSI.COLOR_RESET}]`;
    let cash = `$:${playerStats.chash}`;
    return `${hpBar} ${cash}\n`;
}

function pad(len, text) {
    let output = "";
    for (let i = 0; i < len; i++) {
        output += text;
    }
    return output;
}

export default Labyrinth;

