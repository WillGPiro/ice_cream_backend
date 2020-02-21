// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
// (add cors, pg, and morgan...)
const cors = require('cors');
const pg = require('pg');
const morgan = require('morgan');

// Database Client
// (create and connect using DATABASE_URL)
const Client = pg.Client;
const client = new Client(process.env.DATABASE_URL);
client.connect();

// Application Setup
const app = express();
// (add middleware utils: logging, cors, static files from public)
// app.use(...)
//this will let us host images on our server
app.use('/assets', express.static('assets'));
app.use(morgan('dev'));
app.use(cors());


// API Routes
app.get('/', async(req, res, next) => {
    try {
        res.json({
            welcome: 'home'
        });
    } catch (err) {
        next(err);
    }
});

app.get('/icecream', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT
                id, 
                flavor, 
                img_url, 
                type, 
                vegan, 
                will_licks, 
                logan_licks
            FROM ice_cream;
        `);

        console.log(result.rows);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});
//adding another fetch (an http verb = .get) where we change the URL to use '/icecrea/:flavor'
app.get('/icecream/:flavor', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT
                id, 
                flavor, 
                img_url, 
                type, 
                vegan, 
                will_licks, 
                logan_licks
            FROM ice_cream
            WHERE
                lower(flavor) = $1`,
        
        [req.params.flavor.toLowerCase()]
        );

        console.log(result.rows);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});

// http method and path...

module.exports = {
    app: app
};