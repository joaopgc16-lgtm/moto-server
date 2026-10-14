const Database = require('better-sqlite3');
const db = new Database('motos.db');

try {
  db.exec("ALTER TABLE motos ADD COLUMN descricao TEXT");
  console.log("Coluna descricao adicionada.");
} catch (erro) {
  console.log("Nada feito:", erro.message);
}

// mostra as colunas da tabela pra você conferir
console.log(db.prepare("PRAGMA table_info(motos)").all().map((coluna) => coluna.name));