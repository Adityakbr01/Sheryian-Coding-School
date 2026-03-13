import readline from "readline/promises";

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


export default rl;