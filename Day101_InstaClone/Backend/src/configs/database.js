const mongoose = require("mongoose")
const ENV = require("./env.js")

mongoose.connect(ENV.MONGO_URI)

mongoose.connection.on("connected",(op)=>{
    console.log(`DATABASE CONNECTED`)
    console.log(`MONGODB_HOST : ${mongoose.connection.host}`)
    console.log(`MONGODB_NAME : ${mongoose.connection.name}`)
})

mongoose.connection.on("error",(err)=>{
    console.log(`DATABASE CONNECTION ERROR ${err.message}`)
})

mongoose.connection.on("disconnected",(err)=>{
    console.log(`DATABASE DISCONNECTED ${err.message}`)
})

