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
//client.connect connects to the database, but does not do anything until a route is hit with client.query see get icecream enpoint below. 
const client = new Client(process.env.DATABASE_URL);
client.connect();

// Application Setup
const app = express();
// (add middleware utils: logging, cors, static files from public)
// app.use(...)
//this will let us host images on our server
//
app.use('/assets', express.static('assets'));
app.use(express.json()); // content type we are using is json
app.use(express.urlencoded({ extended: true })); //set's content type to a url encoded form (typically more for a request.body).
app.use(morgan('dev'));
app.use(cors()); //cors is middleware


// API Routes
// Displays home page when you go to the sight on the back end. Does not touch front end. Not technically needed
app.get('/', async(req, res, next) => {
    try {
        res.json({
            welcome: 'home'
        });
    } catch (err) {
        next(err);
    }
});
//External client like superagent makes get request (only works with get request) and should only take parameters from URL and returns information from database. (NOTE  in this case we are not passing parameters here.) In a get request the information is exposed i.e. not encrypted. 
app.get('/icecream', async(req, res) => {
    try {
//Our client query is the information we are 'getting' from our Postgre SQL (Relational Database Management System) which we set up through Heroku. To query this database we need to use the format SELECT FROM JOIN (standard for all SQL)
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
            JOIN types t on ic.type = t.id;
        `);

        console.log(result.rows);
//Res.json returns response that lives on client query as json
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});
//adding another fetch (an http verb = .get) where we change the URL to use '/icecream/:flavor' | reminder 'get' verb just pulls data does NOT change database. This is our "detail page" on the front end. It's simlar to react router in that we pass the parameters to the url. In this case we are looking for the "flavor".
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
                lower(flavor) = $1`, // Index of the array below. In this case "flavor" is =$1
        //We can think of the information following the comma as the 2nd parameter of "client.query". In this case we are saying at the index of $1 return the information in the array as specified. In an array, the order matters.  
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

// types endpoint created from icecream endpoint, updated query with select * from types
app.get('/types/:type', async(req, res) => {
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
                lower(t.name) = $1`,
        
        [req.params.type.toLowerCase()]
        );

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
        `, // We return all, otherwise the array below follows the indexed in the order of the values above. I.e. flavor =
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