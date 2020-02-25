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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
                ic.id, 
                ic.flavor, 
                ic.img_url, 
                t.name "types", 
                ic.vegan, 
                ic.will_licks, 
                ic.logan_licks
            FROM ice_cream ic
            JOIN types t on ic.type = t.id;
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
                ic.id, 
                ic.flavor, 
                ic.img_url, 
                t.name "type", 
                ic.vegan, 
                ic.will_licks, 
                ic.logan_licks
            FROM ice_cream ic
            JOIN types t on ic.type = t.id
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

// types endpoing created from icecream endpoint, updated query with select * from types
app.get('/types', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT
                id,
                name
            FROM types;
        `);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});

//CREATE NEW ICE_CREAM
app.post('/create', async(req, res) => {
    try {
        const result = await client.query(`
        INSERT INTO ice_cream (flavor, img_url, type, vegan, will_licks, logan_licks)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        [req.body.flavor, req.body.img_url, req.body.type, req.body.vegan, req.body.will_licks, req.body.logan_licks]);

        res.json(result.rows[0]);
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