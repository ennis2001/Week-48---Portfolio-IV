import fs from "node:fs";
import { MAP_DIRECTORY } from "../constants.mjs";

function readMapFile(fileName) {
    const filePath = `${MAP_DIRECTORY}${fileName}`;
    if (!fs.existsSync(filePath)) {
        throw new Error(`Map file not found: ${filePath}`);
    }

    let data = fs.readFileSync(filePath, { encoding: "utf8" })
        .trim() // Remove leading/trailing whitespace
        .split("\n")
        .filter(line => line.trim().length > 0) // Remove empty lines
        .map(line => line.split("")); // Split each line into characters

    // Ensure all rows have consistent lengths
    const rowLength = data[0]?.length;
    if (!data.every(row => row.length === rowLength)) {
        throw new Error(`Map file rows have inconsistent lengths in file: ${fileName}`);
    }

    // Ensure the map contains the hero symbol 'H'
    if (!data.some(row => row.includes("H"))) {
        throw new Error(`Map file is missing the hero symbol 'H' in file: ${fileName}`);
    }

    return data;
}

function readRecordFile(fileName) {
    let data = fs.readFileSync(fileName, { encoding: "utf8" });
    return data.split("\n");
}

export { readMapFile, readRecordFile }