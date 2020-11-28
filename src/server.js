const knex = require('knex')
const app = require('./app')
const pg = require('pg');
const {PORT,DATABASE_URL} = require('./config')

pg.defaults.ssl = true;
const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
 
})

app.listen(PORT, ()=> {
    console.log(`Server listening at http://localhost:${PORT}`)
})