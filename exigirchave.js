const jwt = require('jsonwebtoken');

function exigirchave(requisicao, resposta, proximo) {
  const chave = process.env.JWT_SECRET;

  const token = requisicao.cookies.token;

  if (!token) {
    return resposta.status(401).json({ mensagem_de_erro: 'Chave de autenticação inválida.' });
  }

  try {
    requisicao.usuario = jwt.verify(token, chave);
    proximo();
  } catch {
    resposta.status(401).json({ mensagem_de_erro: 'Sessão inválida ou expirada.' });
  }
}

module.exports = exigirchave;