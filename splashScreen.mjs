import ANSI from "./utils/ANSI.mjs";

const outputGraphics = `
 ██▓    ▄▄▄       ▄▄▄▄ ▓██   ██▓ ██▀███   ██▓ ███▄    █ ▄▄▄█████▓ ██░ ██
▓██▒   ▒████▄    ▓█████▄▒██  ██▒▓██ ▒ ██▒▓██▒ ██ ▀█   █ ▓  ██▒ ▓▒▓██░ ██▒
▒██░   ▒██  ▀█▄  ▒██▒ ▄██▒██ ██░▓██ ░▄█ ▒▒██▒▓██  ▀█ ██▒▒ ▓██░ ▒░▒██▀▀██░
▒██░   ░██▄▄▄▄██ ▒██░█▀  ░ ▐██▓░▒██▀▀█▄  ░██░▓██▒  ▐▌██▒░ ▓██▓ ░ ░▓█ ░██
░██████▒▓█   ▓██▒░▓█  ▀█▓░ ██▒▓░░██▓ ▒██▒░██░▒██░   ▓██░  ▒██▒ ░ ░▓█▒░██▓
░ ▒░▓  ░▒▒   ▓▒█░░▒▓███▀▒ ██▒▒▒ ░ ▒▓ ░▒▓░░▓  ░ ▒░   ▒ ▒   ▒ ░░    ▒ ░░▒░▒
░ ░ ▒  ░ ▒   ▒▒ ░▒░▒   ░▓██ ░▒░   ░▒ ░ ▒░ ▒ ░░ ░░   ░ ▒░    ░     ▒ ░▒░ ░
  ░ ░    ░   ▒    ░    ░▒ ▒ ░░    ░░   ░  ▒ ░   ░   ░ ░   ░       ░  ░░ ░
    ░  ░     ░  ░ ░     ░ ░        ░      ░           ░           ░  ░  ░
                       ░░ ░
`;

class SplashScreen {
    constructor() {
        this.dirty = true;
        this.startTime = Date.now(); // Track when the splash screen starts
        this.duration = 3000; // Show the splash screen for 3 seconds
        this.colorCycleSpeed = 1000; // Change color every second (1000 ms)
        this.colors = [ANSI.WHITE, ANSI.YELLOW, ANSI.GREEN]; // Color cycle (white -> yellow -> green)
        this.currentColorIndex = 0;
    }

    update() {
        // Check if the color needs to be updated
        if (Date.now() - this.startTime >= this.colorCycleSpeed) {
            this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length; // Cycle through colors
            this.startTime = Date.now(); // Reset the start time for the color cycle
            this.dirty = true; // Mark the splash screen as dirty to trigger a redraw
        }
    }

    draw() {
        if (this.dirty) {
            this.dirty = false;
            // Apply the current color from the cycle to the graphic
            console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, this.colors[this.currentColorIndex] + outputGraphics);
        }
    }

    isDone() {
        // Check if the splash screen duration has passed
        return Date.now() - this.startTime >= this.duration;
    }
}

export default SplashScreen;
