const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

const db = mysql.createConnection({
  host: "viaduct.proxy.rlwy.net",
  user: "root",
  password: "FjegCDlSwqWWHRSFamYWInphKJoJKMdF",
  port: "54732",
  database: "railway"
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao MySQL');
  }
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  return res.send('hello World')
})

// Rota de exemplo para obter perfis
app.get('/perfis', (req, res) => {
  console.log('Rota /perfis acessada.');
  // Lógica para obter perfis do banco de dados
  const query = 'SELECT * FROM usuarios';

  db.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      res.json(result);
    }
  });
});

// Rota para registrar um novo usuário
app.post('/registro', (req, res) => {
  const { nome, email, senha } = req.body;

  // Verifique se email e senha estão presentes
  if (!nome || !email || !senha) {
    return res.status(400).send('Nome, Email e senha são obrigatórios');
  }

  // Realize validações adicionais, como verificar se o email é único, etc.

  const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  db.query(query, [nome, email, senha], (err, result) => {
    if (err) {
      console.error('Erro ao registrar usuário:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      res.json({ message: 'Usuário registrado com sucesso!', id: result.insertId });
    }
  });
});
// Rota para atualizar os dados de um usuário
// Rota para atualizar os dados de um usuário
app.put('/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const { nome, email, senha } = req.body;

  // Verifique se todos os campos estão presentes
  if (!nome || !email || !senha) {
    return res.status(400).send('Nome, Email e senha são obrigatórios');
  }

  // Realize a atualização no banco de dados
  const query = 'UPDATE usuarios SET nome = ?, senha = ? WHERE email = ?';
  db.query(query, [nome, senha, email], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar usuário:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Usuário atualizado com sucesso!' });
      } else {
        res.status(404).send('Usuário não encontrado');
      }
    }
  });
});


// Rota para autenticar um usuário
app.post('/autenticacao', (req, res) => {
  const { email, senha } = req.body;

  const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  db.query(query, [email, senha], (err, result) => {
    if (err) {
      console.error('Erro ao autenticar usuário:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      if (result.length > 0) {
        // Usuário autenticado com sucesso, agora gera um token
        const tokenPayload = {
          email: result[0].email,
          userId: result[0].id,
          nome: result[0].nome // Adicione o nome do usuário ao payload do token
        };
        const token = jwt.sign(tokenPayload, 'secreto', { expiresIn: '1h' });
        console.log('Token gerado:', token); // Adicione este console.log para verificar o token gerado
        res.json({ message: 'Autenticação bem-sucedida!', usuario: result[0], token });
      } else {
        res.status(401).send('Credenciais inválidas');
      }
    }
  });
});

// Rota para salvar uma nova entrada no banco de dados
app.post('/adicionar-entrada', (req, res) => {
  const { descricao, valor, tipo } = req.body;

  // Verifique se todos os campos estão presentes
  if (!descricao || !valor || !tipo) {
    return res.status(400).send('Descrição, Valor e Tipo são obrigatórios');
  }

  // Realize validações adicionais, se necessário

  // Realize a inserção no banco de dados
  const query = 'INSERT INTO entradas (descricao, valor, tipo) VALUES (?, ?, ?)';
  db.query(query, [descricao, valor, tipo], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar entrada:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      res.json({ message: 'Entrada adicionada com sucesso!', id: result.insertId });
    }
  });
});

app.post('/adicionar-saida', (req, res) => {
  const { descricao, valor, tipo } = req.body;

  // Verifique se todos os campos estão presentes
  if (!descricao || !valor || !tipo) {
    return res.status(400).send('Descrição, Valor e Tipo são obrigatórios');
  }

  // Realize validações adicionais, se necessário

  // Realize a inserção no banco de dados para saídas
  const query = 'INSERT INTO saidas (descricao, valor, tipo) VALUES (?, ?, ?)';
  db.query(query, [descricao, valor, tipo], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar saída:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      res.json({ message: 'Saída adicionada com sucesso!', id: result.insertId });
    }
  });
});

app.get('/saidas', (req, res) => {
  const query = 'SELECT * FROM saidas';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao buscar entradas:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      res.json(result);
    }
  });
});


// Rota para obter todas as entradas do banco de dados
app.get('/entradas', (req, res) => {
  const query = 'SELECT * FROM entradas';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao buscar entradas:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      res.json(result);
    }
  });
});

// Rota para deletar uma entrada específica do banco de dados
app.delete('/entradas/:id', (req, res) => {
  const entradaId = req.params.id;

  // Realize a exclusão no banco de dados
  const query = 'DELETE FROM entradas WHERE id = ?';
  db.query(query, [entradaId], (err, result) => {
    if (err) {
      console.error('Erro ao deletar entrada:', err);
      res.status(500).send('Erro interno no servidor');
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Entrada deletada com sucesso!' });
      } else {
        res.status(404).send('Entrada não encontrada');
      }
    }
  });
});




app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
