function exigirAdmin(req, res, next) {
  if (req.usuario?.papel !== 'admin') {
    return res.status(403).json({ mensagem_de_erro: 'Acesso negado. Permissão de administrador necessária.' })
  }
  next()
}

module.exports = exigirAdmin