const express = require ('express');
const app = express();

const PORT = 8080; // defualt port 8080

app.set("view engine", "ejs");

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}))

const cookieParser = require('cookie-parser');
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}
// all my browse routes
app.get('/', (req, res) => {
  res.send("Hello")
});

app.get ("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
})

app.get('/urls/new', (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]}
  res.render('urls_new', templateVars);
})

app.get('/urls/:shortURL', (req, res)=> {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  console.log(templateVars)
  res.render("urls_show", templateVars);
})

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL)
})

//all my updates 
app.post("/urls", (req, res) => {
  const longBodyURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longBodyURL;
  //console.log(req.body);
  res.redirect(`/urls/${shortURL}`)
})

//what happens after you click on that delete button 
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];

  res.redirect("/urls")
})

//what happens when you click on the edit button 
app.post("/urls/:shortURL", (req, res) => {
  console.log("Post request fired")
  const longURL = req.body.newURL
  const shortURL = req.params.shortURL
  console.log(longURL)
  console.log(shortURL)

  urlDatabase[shortURL]=longURL

  res.redirect("/urls")
})

// What happens when you click on the login button
app.post('/login', (req, res) => {
  res.cookie("username", req.body["username"])
  //console.log(req.body)
  res.redirect("/urls")
})

// What happens when you click on the logout button 
app.post('/logout', (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
})

//setting up the listener 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 