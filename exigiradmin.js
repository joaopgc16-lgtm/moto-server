function exigirAdmin(req, res, next) {
    const usuario = req.usuario;
    const papel = usuario?.papel;
    if (papel !== 'admin') { return res.status(403).json({ mensagem_de_erro: 'Acesso negado. Permissão de administrador necessária.' }); }
     next()
    console.error(erro)
    res.status(500).json({ mensagem_de_erro: 'Erro ao verificar permissão de administrador.' });
}module.exports = exigirAdmin;