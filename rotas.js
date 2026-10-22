const express = require('express');
const db = require('./db');
const exigirchave = require('./exigirchave');
const router = express.Router();


router.param('id', (requisicao, resposta, next, valor) => {
  if (Number.isNaN(parseInt(valor))) {
    return resposta.status(404).json({ mensagem_de_erro: 'ID INEXISTENTE' })
  }
  next()
})
  
router.get('/', async (requisicao, resposta) => {
try{
  const termo = requisicao.query.motosearch?.replace(/_/g, " ") || "";
  if (termo.trim() === "") {
    const lista = await db.query('SELECT * FROM motos ORDER BY id')
     return resposta.json({ resultado: [], listas: lista.rows })
    }
    const palavras = termo.split(' ').filter(Boolean)
    const condicoes = palavras.map((palavras, i) => `(nome || ' ' || ano || ' ' || marca) ILIKE $${i + 1}`);
    const valores = palavras.map((palavra) => `%${palavra}%`)
    const sql = "SELECT * FROM motos WHERE " + condicoes.join(" AND ")
    const lista = await db.query(sql, valores)
     console.log("VERSAO NOVA", requisicao.query);
    resposta.status(200).json({resultado: lista.rows});
} catch(erro){
  console.error(erro)
  resposta.status(500).json({mensagem_de_erro: "Não foi possível procurar."})
}
});

router.get('/motos/:id', async (requisicao, resposta) => {
  try{
    const id = parseInt(requisicao.params.id)
    const moto = await db.query("SELECT * FROM motos WHERE id = $1", [id])
    if(moto.rowCount === 0){
      return resposta.status(404).json({mensagem_de_erro: "ID inexistente"})
    }
 resposta.json(moto.rows[0])
  } catch (erro) {
    console.error(erro)
    resposta.status(500).json({ mensagem_de_erro: 'Erro ao buscar a moto.' })
  }
});

router.post('/addmotos', exigirchave, async (requisicao, resposta) => {
  try{
  const {nome, ano, marca, imagem, descricao} = requisicao.body
  if(!nome || !ano || !marca){
    return resposta.status(400).json({mensagem_de_erro:"É necessário inserir um nome, ano ou marca." })
  }
  const lista = await db.query(`INSERT INTO motos (nome, ano, marca, imagem, descricao) VALUES($1 ,$2 ,$3 ,$4 ,$5) RETURNING *`, [nome, ano, marca, imagem ?? null, descricao ?? null])
   resposta.status(201).json({ moto: lista.rows[0] })
} catch(erro){
  console.error(erro)
  resposta.status(500).json({
    mensagem_de_erro: "Não foi possível adicionar a moto.",
    detalhe: erro.message
  })
}
});

router.put('/modifymoto/:id', exigirchave, async (requisicao, resposta) => {
try{
  const id = parseInt(requisicao.params.id)
  const {nome, ano, marca, imagem, descricao} = requisicao.body
  if(!nome || !ano || !marca){
    return resposta.status(400).json({mensagem_de_erro:"É necessário inserir um nome, ano ou marca." })
  }
   const lista = await db.query(`UPDATE motos SET nome = $1, ano = $2, marca = $3, imagem = $4, descricao = $5 WHERE id = $6`, [nome, ano, marca, imagem ?? null, descricao ?? null, id])
   if(lista.rowCount === 0){
   return resposta.status(404).json({mensagem_de_erro: "Não foi possível completar a alteração."})
  }
  resposta.status(200).json(lista.rowCount > 0 ? {mensagem: `moto ${id} alterada`} : {mensagem: "Nenhuma alteração feita."} )
 }catch(erro){
  console.error(erro)
   resposta.status(500).json({mensagem_de_erro: "Erro ao alterar a moto."})
 }
})

router.delete('/motosdelete/:id', exigirchave, async (requisicao, resposta) => {
  const id = parseInt(requisicao.params.id);
  try{
   const lista = await db.query(`DELETE FROM motos WHERE id = $1`, [id])
    if(lista.rowCount === 0){
    return resposta.status(404).json({mensagem_de_erro: 'ID INEXISTENTE'})
  }
  resposta.json({mensagem: `moto ${id} removida`});
} catch(erro){
  console.error(erro)
  resposta.status(500).json({mensagem_de_erro: "Erro ao remover a moto."})
}
});

module.exports = router;