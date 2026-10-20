const express = require('express');
const db = require('./db');
const exigirchave = require('./exigirchave');
const router = express.Router();

router.get('/', (requisicao, resposta) => {
try{
    const lista = db.prepare("SELECT * FROM motos").all();
  const termo = requisicao.query.motosearch?.toLowerCase().replace(/_/g, " ") || "";
  if (termo.trim() === "") {
        return resposta.json({resultado: [], listas:lista })
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

router.get('/motos/:id', (requisicao, resposta) => {
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
});

router.post('/addmotos', exigirchave, (requisicao, resposta) => {
  try{
  const {nome, ano, marca, imagem, descricao} = requisicao.body
  if(!nome || !ano || !marca){
    return resposta.status(400).json({mensagem_de_erro:"É necessário inserir um nome, ano ou marca." })
  }
  const lista = db.prepare("INSERT INTO motos (nome, ano, marca, imagem, descricao) VALUES(?,?,?,?,?)").run(nome, ano, marca, imagem ?? null, descricao ?? null)
   resposta.status(201).json({ id: lista.lastInsertRowid, nome, ano, marca, imagem: imagem ?? null })
} catch(erro){
  console.error(erro)
  resposta.status(500).json({mensagem_de_erro: "Não foi possível adicionar a moto."})
}
});

router.put('/modifymoto/:id', exigirchave, (requisicao, resposta) => {
try{
  const id = parseInt(requisicao.params.id)
  const {nome, ano, marca, imagem, descricao} = requisicao.body
  if(!nome || !ano || !marca){
    return resposta.status(400).json({mensagem_de_erro:"É necessário inserir um nome, ano ou marca." })
  }
   const lista = db.prepare(`UPDATE motos SET nome = ?, ano = ?, marca = ?, imagem = ?, descricao = ? WHERE id = ?`).run(nome, ano, marca, imagem ?? null, descricao ?? null, id)
   if(lista.changes === 0){
   return resposta.status(404).json({mensagem_de_erro: "Não foi possível completar a alteração."})
  }
  resposta.status(200).json(lista)
 }catch(erro){
  console.error(erro)
   resposta.status(500).json({mensagem_de_erro: "Erro ao alterar a moto."})
 }
})

router.delete('/motosdelete/:id', exigirchave, (requisicao, resposta) => {
  const id = parseInt(requisicao.params.id);
  try{
   const lista = db.prepare(`DELETE FROM motos WHERE id = ?`).run(id)
    if(lista.changes === 0){
    return resposta.status(404).json({mensagem_de_erro: 'ID INEXISTENTE'})
  }
  resposta.json({mensagem: `moto ${id} removida`});
} catch(erro){
  console.error(erro)
  resposta.status(500).json({mensagem_de_erro: "Erro ao remover a moto."})
}
});

module.exports = router;