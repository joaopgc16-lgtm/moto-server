const express = require('express');
const app = express();
const cors = require('cors');
const rotasMotos = require('./rotas');

app.use(cors());
app.use(express.json());
app.use(rotasMotos
)

app.listen(5000, () => {
    console.log('Servidor rodando em http://localhost:5000');
});