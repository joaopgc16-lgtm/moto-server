const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const db = require('./db');
const usuarios = require('./db_usuarios');
const exigirchave = require('./exigirchave');
const bcrypt = require('bcrypt');
const router = express.Router();

const opcoesCookie = {
  httpOnly: true,                                  
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 1000
};
router.post('/cadastro', async (requisicao, resposta) => {
  try {
    const { usuario, senha, email } = requisicao.body;
    if (!usuario || !senha || !email || senha.length < 8) {
      return resposta.status(400).json({ mensagem_de_erro: "Informe usuário, email e senha (mínimo 8 caracteres)." });
    }
    const hash = await bcrypt.hash(senha, 10);
    await usuarios.query("INSERT INTO usuarios (usuario, email, senha_hash) VALUES ($1, $2, $3)", [usuario, email, hash]);
    resposta.status(201).json({ mensagem: "Conta criada." });
  } catch (erro) {
    if (erro.code === '23505') {
      return resposta.status(409).json({ mensagem_de_erro: "Esse usuário já existe." });
    }
    console.error(erro);
    resposta.status(500).json({ mensagem_de_erro: "Erro ao criar a conta." });
  }
});

router.post('/login', async (requisicao, resposta) => {
  try {
    const { usuario, senha } = requisicao.body;
    if (!usuario || !senha) {
      return resposta.status(400).json({ mensagem_de_erro: "Informe usuário e senha." });
    }
    const resultado = await usuarios.query("SELECT id, usuario, email, senha_hash   FROM usuarios WHERE usuario = $1", [usuario]);
    if (resultado.rowCount === 0) {
      return resposta.status(401).json({ mensagem_de_erro: "Usuário ou senha incorretos." });
    }
    const usuarioEncontrado = resultado.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuarioEncontrado.senha_hash);
    if (!senhaValida) {
      return resposta.status(401).json({ mensagem_de_erro: "Usuário ou senha incorretos." });
    }
    const token = jwt.sign({ id: usuarioEncontrado.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    resposta.cookie('token', token, opcoesCookie);
    resposta.json({ mensagem: "Login realizado com sucesso.", usuario: { id: usuarioEncontrado.id, usuario: usuarioEncontrado.usuario, email: usuarioEncontrado.email, papel: usuarioEncontrado.papel }});
  } catch (erro) {
    console.error(erro);
    resposta.status(500).json({ mensagem_de_erro: "Erro ao realizar login." });
  }
});

router.get('/eu', exigirchave, (req, res) => res.json({ id: req.usuario.id, papel: req.usuario.papel }));

router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...opcoesCookie, maxAge: undefined });
  res.json({ mensagem: 'Saiu.' });
});

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