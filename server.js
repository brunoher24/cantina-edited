const express = require('express')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const path = require('path')
// const cors = require("cors");

const app = express()
// app.use(cors());
const router = require('./router')

app.use('/images', express.static(path.join(__dirname, 'photos/')))

// CORS
app.use('/', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
})
app.use(bodyParser.json())
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).json({errorMessage: err.message})
})

app.use('/api', router)

app.listen(9000, function () {
    return console.log(chalk.green(`✅  Le serveur d'API est lancé sur http://localhost:9000/api/`))
})