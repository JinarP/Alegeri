const express = require('express');
const app = express();
const client = require("./routes/dbconection");
let path = require("path");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set('view engine', 'jade');

app.get('/', (req, res) => {
  res.render('login')
});

app.get('/register', async (req, res) => {
  res.render('register');
});

let username;
app.post('/login', async (req, res) => {
  try {
    username = req.body.username;
    const psw = req.body.password;
    const users = await client.query('SELECT usname, parola FROM users WHERE usname = $1', [username]);
    const validpsw = users.rows[0].parola;
    if ((users.rows.length > 0 && username === users.rows[0].usname) && (psw === validpsw)) {
      res.render('startpage')
    } else {
      res.send("Username sau parolă greșite");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post('/register', async (req, res) => {
  try {
    username = req.body.usname;
    const passw = req.body.password;
    const repetpsw = req.body.repetpw;
    const document = await client.query('SELECT usname FROM users WHERE usname = $1', [username]);
    if (document.rowCount === 0) {
      if (passw === repetpsw) {
        client.query('INSERT INTO users (usname, parola) VALUES ($1, $2)', [username, passw]);
        res.render('startpage')
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

app.get('/profile/viewProfile', async (req, res) => {
  try {
    const response = await client.query(`SELECT descriere FROM users WHERE usname = $1`, [username])
    const description = response.rows[0] || {descriere:"nu exista o descriere"};
    res.render('profile', {description});
  } catch (error) {
    res.status(404).send("Some server errors");
  }
});

app.post('/profile/addDescription', async (req, res) => {
  const newDescrition = req.body.dsc;
  client.query('UPDATE users SET descriere = $1 WHERE usname = $2 RETURNING *', [newDescrition, username]);
  const description = {descriere:newDescrition}; 
  res.render('profile', {description});
});

app.post('/profile/newCandidat', async (req, res) => {
  client.query('INSERT INTO candidati (nume, voturi) VALUES ($1, $2)', [username, 0]);
});

app.get('/list/seeuser', async (req, res) => {
  const { user } = req.query;
  try {
    const response = await client.query(`SELECT descriere FROM users WHERE usname = $1`, [user])
    const description = response.rows[0].descriere;

    res.status(200).send(description);
  } catch (error) {
    res.status(404).send("Some server errors");
  }
});

app.get ('/list/vot', async (req, res) => {
  const { user } = req.query;
  const result = await client.query('SELECT voturi FROM candidati WHERE nume = ($1)', [user]);
  const vot_number = result.rows[0].voturi;
  const newVotNumber = vot_number + 1;
  await client.query('UPDATE candidati SET voturi = $1 WHERE nume = $2', [newVotNumber, user]);
  res.send('Votul a fost înregistrat cu succes!');
});

app.get('/startpage/list', async (req, res) => {
  try {
    const document = await client.query("SELECT nume FROM candidati ORDER BY voturi DESC ");
    let variable = "";
    document.rows.forEach(row => {
      variable += `${row.nume}
        <button onclick="window.location.href='/list/seeuser?user=${row.nume}'">VIEW DESCRIPTION</button>
        <button onclick="window.location.href='/vot?user=${row.nume}'">VOT</button>
        <br>`;
    });
    res.send(variable);
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;