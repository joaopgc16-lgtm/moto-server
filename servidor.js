const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rotasMotos = require('./rotas');
const origens = (process.env.FRONT_URLS ?? 'http://localhost:5173,http://localhost:5174').split(',')

app.use(cors({ origin: origens, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(rotasMotos)

app.listen(process.env.PORT || 5000, () => {
  console.log('Servidor rodando')
})