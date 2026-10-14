const Database = require('better-sqlite3');
const db = new Database('motos.db');

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
   

app.get('/', (requisicao, resposta) => {
try{
    const lista = db.prepare("SELECT * FROM motos").all();
  const termo = requisicao.query.motosearch?.toLowerCase().replace(/_/g, " ") || "";
  if (termo.trim() === "") {
        return resposta.json({ resultado: [],})
    }
  const resultados = lista.filter((moto) => {
    const textoCompleto = `${moto.nome} ${moto.ano} ${moto.marca}`.toLowerCase();
    return termo.split(" ").every((palavra) => textoCompleto.includes(palavra))
  })
     console.log("VERSAO NOVA", requisicao.query);
    resposta.status(200).json({ resultado: resultados, listas: lista});
} catch(erro){
  console.error(erro)
  resposta.status(500).json({mensagem_de_erro: "Não foi possível procurar."})
}
});

app.get('/motos/:id', (requisicao, resposta) => {
  try{
    const id = parseInt(requisicao.params.id)
    const moto = db.prepare("SELECT * FROM motos WHERE id = ?").get(id)
    if(!moto){
      return resposta.status(404).json({mensagem_de_erro: "ID inexistente"})
    }
 resposta.json(moto)
  } catch (erro) {
    console.error(erro)
    resposta.status(500).json({ mensagem_de_erro: 'Erro ao buscar a moto.' })
  }
})

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});