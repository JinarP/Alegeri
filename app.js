const express = require('express');
const app = express();
const client = require("./routes/dbconection");
let path = require("path");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/login.html'))
});

app.get('/register', async (req, res) => {
  res.sendFile(path.join(__dirname, '/views/register.html'));
});

app.post('/finishregister', async (req, res) => {
  try {
    const username = req.body.usname;
    const passw = req.body.password;
    const repetpsw = req.body.repetpw;
    const document = await client.query('SELECT usname FROM users WHERE usname = $1', [username]);
    if (document.rowCount === 0) {
      if (passw === repetpsw) {
        client.query('INSERT INTO users (usname, parola) VALUES ($1, $2)', [username, passw]);
        res.sendFile(path.join(__dirname, '/views/startpage.html'))
      } else {
        res.send("Parolă greșita");
      }
    } else {
      res.send("Username-ul exista deja");
    }

  } catch (error) {
    console.log(error);
  }
});

let username;
app.post('/login', async (req, res) => {
  try {
    username = req.body.username;
    const psw = req.body.password;
    const users = await client.query('SELECT usname FROM users WHERE usname = $1', [username]);
    const validpsw = await client.query('SELECT parola FROM users WHERE usname = $1', [username]);
    if ((users.rows.length > 0 && username === users.rows[0].usname) && (psw === validpsw.rows[0].parola)) {
      res.sendFile(path.join(__dirname, '/views/startpage.html'))
    } else {
      res.send("Username sau parolă greșite");
    }
  } catch (error) {
    console.log(error);
  }
});



app.get('/getDescription', async (req, res) => {
  try {
    const response = await client.query(`SELECT descriere FROM users WHERE usname = $1`, [username])
    const description = response.rows[0]; 
    res.status(200).send(description);
  } catch (error) {
    res.status(404).send("Some server errors");
  }
});


app.post('/addDescription', async (req, res) => {
  const description = req.body.dsc;
  client.query('UPDATE users SET descriere = $1 WHERE usname = $2', [description, username]);
});

app.post('/newcandidat', async (req, res) => {
  client.query('INSERT INTO candidati (nume) VALUES ($1)', [username]);
});

app.get('/seeuser', async (req, res) => {
  const { user } = req.query;
  try {
    const response = await client.query(`SELECT descriere FROM users WHERE usname = $1`, [user])
    const description = response.rows[0].descriere;

    res.status(200).send(description);
  } catch (error) {
    res.status(404).send("Some server errors");
  }
});

app.get('/list', async (req, res) => {
  try {
    const document = await client.query("SELECT nume FROM candidati");
    let variable = "";
    document.rows.forEach(row => {
      variable += `${row.nume}
        <button onclick="window.location.href='/seeuser?user=${row.nume}'">VIEW DESCRIPTION</button>
        <button>VOT</button>
        <br>`;
    });
    res.send(variable);
  } catch (error) {
    console.log(error);
  }
});


module.exports = app;