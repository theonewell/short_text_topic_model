//js
const express = require('express');
var session = require('express-session')
var bodyParser = require('body-parser')

//dotenv to stop global variables
require('dotenv').config()

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
    //set up express session 
app.use(session({
    secret: 'somerandomstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 7200000
    }
}));


//ejs view engine
app.set('view engine', 'ejs');
//Routes
app.use('/', require('./routes/master'));
app.use('/video', require('./routes/video'));
app.use('/api', require('./routes/api'));
app.use('/transcript', require('./routes/transcript'));
app.use('/pdf', require('./routes/pdf'));

//Start server with node index.js on port 4111
const PORT = process.env.PORT || 4111;
app.listen(PORT, console.log("Server has started at port " + PORT))