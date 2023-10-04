const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Load Config
const jsonFile = fs.readFileSync("./config.json", "utf-8");
const config = JSON.parse(jsonFile);

// Express
const fileserver = express(); 
fileserver.use(bodyParser.urlencoded({ extended: true }));
fileserver.use(cors)

// status check
fileserver.get('/', function (req, res) {
    res.render('index', { "status" : "OK" });
})

// post
fileserver.post("/upload", function (req, res) {
    var reqJson = JSON.stringify(req.body);
    fs.writeFileSync('./test.json', reqJson)
    console.log(req.data);
    // console.log(res);

    res.end();
})

// start
fileserver.listen(config.image_port, () => {
    console.log(`Fileserver Started on port ${config.image_port}`)
})