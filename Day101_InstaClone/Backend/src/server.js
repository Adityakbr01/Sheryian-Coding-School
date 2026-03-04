const { default: mongoose } = require("mongoose");
const app = require("./app.js");
const ENV = require("./configs/env.js");
require("./configs/database.js");

const server = app.listen(ENV.PORT, (op) => {
  console.log(`Server running on port ${ENV.PORT}`);
});

process.on("SIGINT", () => {
  console.log("\nSIGTERM received Closing SERVER");
  
  server.close(() => {
    console.log("EXPRESS SERVER CLOSED");

    mongoose.connection.close();
    console.log("Mongoose Connection Closed");

    process.exit(0);
  });
});

console.log(`SERVER LOG`, JSON.stringify(server.address()));
