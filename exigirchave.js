

function exigirchave(requisicao, resposta, proximo){
  const jwt = require('jsonwebtoken')
  const chave = process.env.JWT_SECRET
  const cabecalho = requisicao.headers['authorization'] ?? '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if(!token){
    return resposta.status(401).json({mensagem_de_erro: 'Chave de autenticação inválida.'})
  }
  try{
    requisicao.usuario = jwt.verify(token, chave)
    proximo()
  } catch {
    resposta.status(401).json({ mensagem_de_erro: 'Sessão inválida ou expirada.' });
  }
}

module.exports = exigirchave