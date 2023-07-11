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
    const users = await client.query('SELECT usname FROM users WHERE usname = $1', [username]);
    const validpsw = await client.query('SELECT password FROM users WHERE usname = $1', [username]);
    if ((users.rows.length > 0 && username === users.rows[0].usname) && (psw === validpsw.rows[0].password)) {
      res.render('startpage')
    } else {
      res.send("Wrong username or password");
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
        client.query('INSERT INTO users (usname, password) VALUES ($1, $2)', [username, passw]);
        res.render('startpage')
      } else {
        res.send("Wrong passwod");
      }
    } else {
      res.send("Username already exist");
    }

  } catch (error) {
    console.log(error);
  }
});

app.get('/profile/viewProfile', async (req, res) => {
  try {
    const response = await client.query(`SELECT description FROM users WHERE usname = $1`, [username])
    const description = response.rows[0] || { description: "Description do not exist" };
    res.render('profile', { description });
  } catch (error) {
    res.status(404).send("Some server errors");
  }
});

app.post('/profile/addDescription', async (req, res) => {
  try {
    const newDescrition = req.body.dsc;
    client.query('UPDATE users SET description = $1 WHERE usname = $2 RETURNING *', [newDescrition, username]);
    const description = { description: newDescrition };
    res.render('profile', { description });
  } catch (error) {
    console.log(error);
    res.status(404).send("Some server errors");
  }
});

app.post('/profile/newCandidate', async (req, res) => {
  try {
    const document = await client.query('SELECT name FROM candidates WHERE name = $1', [username]);
    if (document.rowCount === 0) {
    client.query('INSERT INTO candidates (name, votes) VALUES ($1, $2)', [username, 0]);
    res.send ("You are now on candidates list, congratulations")
    } else {
      res.send ("You are already on the list of candidates")
    }
  } catch (error) {
    console.log(error)
    res.status(404).send("Some server errors");
  }
  
});

app.get('/list/seeCandidate', async (req, res) => {
  const { user } = req.query;
  try {
    const response = await client.query(`SELECT description FROM users WHERE usname = $1`, [user])
    const description = response.rows[0].description || "Description do not exist";

    res.status(200).send(description);
  } catch (error) {
    res.status(404).send("Some server errors");
  }
});

app.get('/list/votes', async (req, res) => {
  try {
    const { user } = req.query;
    const result = await client.query('SELECT votes FROM candidates WHERE name = ($1)', [user]);
    const vot_number = result.rows[0].votes;
    const newVotNumber = vot_number + 1;
    await client.query('UPDATE candidates SET votes = $1 WHERE name = $2', [newVotNumber, user]);
    res.send('The vote was registered successfully!');
  } catch (error) {
    console.log(error);
    res.status(404).send("Some server errors");
  }
});

app.get('/list/candidates', async (req, res) => {
  try {
    const document = await client.query("SELECT name FROM candidates ORDER BY votes DESC ");
    const variable = document.rows;
    res.render('candidateList', {variable});
  } catch (error) {
    console.log(error);
    res.status(404).send("Some server errors");
  }
});

module.exports = app;