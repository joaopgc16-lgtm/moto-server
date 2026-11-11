
const jwt = require('jsonwebtoken');

function exigirchave(requisicao, resposta, proximo) {
  const chave = process.env.JWT_SECRET;

  const tokenCookie = requisicao.cookies?.token;
  const cabecalho = requisicao.headers['authorization'] ?? '';
  const token = tokenCookie ?? (cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null);

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