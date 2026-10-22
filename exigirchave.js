function exigirchave(requisicao, resposta, next){
  const chave = process.env.CHAVE_ADMIN
if(!chave || requisicao.headers['x-api-key'] !== chave){
  return resposta.status(401).json({mensagem_de_erro: "Chave de API inválida"})
}next();
}module.exports = exigirchave