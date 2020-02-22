require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
// import seed data:
const { iceCream, types } = require('./seed');

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        await client.connect();

        // map every item in the array data
        const iceCreamQueries = iceCream.map(cold => {

            // This is the query to insert a cat into the db.
            // First argument is the function is the "parameterized query"
            return client.query(`
            INSERT INTO ice_cream (flavor, img_url, type, vegan, will_licks, logan_licks)
            VALUES ($1, $2, $3, $4, $5, $6);
            `,
            //pass teh values in an array so that pg.client can santize them. 
            [cold.flavor, cold.img_url, cold.type, cold.vegan, cold.will_licks, cold.logan_licks]);

        });

        // map every item in the array data
        const typesQueries = types.map(type => {

            // This is the query to insert a type into the types table in the db.
            // First argument is the function is the "parameterized query"
            return client.query(`
            INSERT INTO types (name)
            VALUES ($1);
            `,
            //pass teh values in an array so that pg.client can santize them. 
            [type.name]);

        });
    
        // "Promise all" does a parallel execution of async tasks
        await Promise.all(
            iceCreamQueries.concat(typesQueries)
        );

        console.log('seed data load complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
    
}