const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors'); // Importa o pacote cors

const app = express();
app.use(cors()); // Permite todas as origens
app.use(bodyParser.json());

// Conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',  // Substitua com sua senha do MySQL
  database: 'sunrings',
  port: 3306,
  connectTimeout: 30000
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com o banco de dados estabelecida!');
});

// Rota para a raiz do servidor
app.get('/', (req, res) => {
  res.send('Servidor está funcionando!');
});

// Endpoint para receber os jogadores
app.post('/salvar-jogadores', (req, res) => {
  const jogadores = req.body.jogadores;

  connection.beginTransaction(err => {
    if (err) {
      return res.status(500).send('Erro ao iniciar a transação.');
    }

    const query = `INSERT INTO SUNRINGS (NOME) VALUES (?)`;
    const promises = jogadores.map(jogador => {
      return new Promise((resolve, reject) => {
        connection.query(query, [jogador.nome], (err, result) => {
          if (err) {
            console.error('Erro ao salvar no banco:', err);
            return reject(err);
          }
          resolve(result);
        });
      });
    });

    Promise.all(promises)
      .then(() => {
        connection.commit(err => {
          if (err) {
            console.error('Erro ao finalizar a transação:', err);
            return connection.rollback(() => {
              res.status(500).send('Erro ao salvar no banco de dados.');
            });
          }
          res.send('Jogadores salvos com sucesso!');
        });
      })
      .catch(err => {
        connection.rollback(() => {
          res.status(500).send('Erro ao salvar no banco de dados.');
        });
      });
  });
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
