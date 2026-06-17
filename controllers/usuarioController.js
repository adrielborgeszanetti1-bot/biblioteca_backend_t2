const { pool } = require('../config');
const Usuario = require('../entities/usuario');

const montaUsuario = (row) => new Usuario(row.email, row.nome, row.telefone, row.tipo);

const getUsuariosDB = async () => {
    try {    
        const { rows } = await pool.query('SELECT * FROM usuarios ORDER BY nome');
        return rows.map(montaUsuario);        
    } catch (err) {
        throw "Erro : " + err;
    }
}

const addUsuarioDB = async (body, tipoPadrao = 'U') => {
    try {   
        const { nome, email, telefone, senha } = body; 
        const tipo = tipoPadrao;
        if (!nome || !email || !telefone || !senha) {
            throw "Informe nome, email, telefone e senha.";
        }
        const results = await pool.query(`INSERT INTO usuarios (nome, email, tipo, telefone, senha) 
            VALUES ($1, $2, $3, $4, $5)
            returning nome, email, tipo, telefone`,
        [nome, email, tipo, telefone, senha]);
        const l = results.rows[0];
        return montaUsuario(l); 
    } catch (err) {
        throw "Erro ao inserir o usuario: " + err;
    }    
}

const updateUsuarioDB = async (body, email) => {
    try {   
        const { nome, email: novoEmail, telefone, senha, tipo } = body; 
        if (!nome || !novoEmail || !telefone) {
            throw "Informe nome, email e telefone.";
        }
        // tipo is optional; when provided it will update, otherwise keep existing
        const results = await pool.query(`UPDATE usuarios set nome = $2, email = $3, telefone = $4, senha = COALESCE(NULLIF($5, ''), senha), tipo = COALESCE(NULLIF($6, ''), tipo)
            where email = $1 
            returning nome, email, tipo, telefone`,
        [email, nome, novoEmail, telefone, senha ?? '', tipo ?? '']);        
        if (results.rowCount == 0){
            throw `Nenhum registro encontrado com o email ${email} para ser alterado`;
        }
        const l = results.rows[0];
        return montaUsuario(l);
    } catch (err) {
        throw "Erro ao alterar o usuario: " + err;
    }      
}

const deleteUsuarioDB = async (email) => {
    try {           
        const results = await pool.query(`DELETE FROM usuarios where email = $1`,
        [email]);
        if (results.rowCount == 0){
            throw `Nenhum registro encontrado com o email ${email} para ser removido`;
        } else {
            return "Usuario removido com sucesso";
        }       
    } catch (err) {
        throw "Erro ao remover o usuario: " + err;
    }     
}

const getUsuarioPorEmailDB = async (email) => {
    try {           
        const results = await pool.query(`SELECT * FROM usuarios where email = $1`,
        [email]);
        if (results.rowCount == 0){
            throw "Nenhum registro encontrado com o email: " + email;
        } else {
            const l = results.rows[0];
            return montaUsuario(l);
        }       
    } catch (err) {
        throw "Erro ao recuperar o usuario: " + err;
    }     
}

const getUsuarioLogadoDB = async (email) => {
    return getUsuarioPorEmailDB(email);
}

const updateUsuarioLogadoDB = async (body, emailAtual) => {
    return updateUsuarioDB(body, emailAtual);
}

const deleteUsuarioLogadoDB = async (email) => {
    return deleteUsuarioDB(email);
}

module.exports = {
    getUsuariosDB,
    addUsuarioDB,
    updateUsuarioDB,
    deleteUsuarioDB,
    getUsuarioPorEmailDB,
    getUsuarioLogadoDB,
    updateUsuarioLogadoDB,
    deleteUsuarioLogadoDB
}
