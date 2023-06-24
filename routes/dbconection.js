const Pool = require("pg").Pool;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'alegeri',
  password: 'jinar10',
  port: 5432,
});
pool.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
module.exports = pool;