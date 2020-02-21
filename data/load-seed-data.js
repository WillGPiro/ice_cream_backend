require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
// import seed data:
const iceCream = require('./seed');

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        await client.connect();
    
        // "Promise all" does a parallel execution of async tasks
        await Promise.all(
            // map every item in the array data
            iceCream.map(cold => {

                
                // This is the query to insert a cat into the db.
                // First argument is the function is the "parameterized query"
                return client.query(`
                INSERT INTO ice_cream (flavor, img_url, type, vegan, will_licks, logan_licks)
                VALUES ($1, $2, $3, $4, $5, $6);
                `,
                
                [cold.flavor, cold.img_url, cold.type, cold.vegan, cold.will_licks, cold.logan_licks]);

            })
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