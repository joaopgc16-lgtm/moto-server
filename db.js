const Database = require('better-sqlite3');
const db = new Database('motos.db');
module.exports = db;