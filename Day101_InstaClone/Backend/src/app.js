const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const CookieParser = require("cookie-parser")

// External Modules
const ENV = require("./configs/env.js")
const routes = require("./routes/index.js")
const { PREFIX_URL } = require("./constants/CONSTANTS.JS")


const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(CookieParser())
app.use(ENV.NODE_ENV==="development" ? morgan("dev") : morgan("combined"))


/**
 * @app
 * @desc   API Prefix
 * @access Public
 */
app.use(PREFIX_URL.v1.root, routes);


module.exports = app