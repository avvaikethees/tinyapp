const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { emailAlreadyExists, getUserByEmail, urlsForUser } = require('./helpers');


// *******************************
// *       SERVER SETUP
// *******************************
const PORT = 8080; // defualt port 8080
const app = express();
app.set("view engine", "ejs");


// *******************************
// *       MIDDLEWARE
// *******************************
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

// *******************************
// *       DATA
// *******************************
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL:  "http://www.google.com", userID: "user2RandomID" },
};

const usersDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//function to generate a random alphanumeric 6 character string
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}


// *******************************
// *       ROUTES
// *******************************

//View --------------------------

app.get('/', (req, res) => {
  let userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const usersURLs = urlsForUser(urlDatabase, userID);
  const templateVars = { urls: usersURLs, userID: req.session.user_id, user:usersDatabase[userID]};
  
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let userID = req.session.user_id;
  const templateVars = {urls: urlDatabase, userID: req.session.user_id, user:usersDatabase[userID]};
  if (userID) {
    res.render('urls_new', templateVars);
  } else {
    res.status(403).redirect("/login");
  }
});

app.get('/register', (req, res) => {
  const templateVars = {userID: null};
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {userID: null};
  res.render('urls_login', templateVars);
});

app.get('/urls/:shortURL', (req, res)=> {
  
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const userUrlDatabase = urlsForUser(urlDatabase, userID);
  
  if (shortURL in userUrlDatabase) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: req.session.user_id, user: usersDatabase[userID]};
    res.render("urls_show", templateVars);
  } else {
    res.status(404). send(`Whoops! Check again, TinyURL ${shortURL} doesn't exist`);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// ACTION ----------------------------------------------------

app.post("/urls", (req, res) => {
  const longBodyURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL: longBodyURL, userID: userID };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//** what happens after you click on that delete button **
app.post("/urls/:shortURL/delete", (req, res) => {

  if (!req.session.user_id) {
    return res.status(404).send("Need to be logged in");
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

// ** what happens when you click on the edit button  **
app.post("/urls/:shortURL", (req, res) => {
  console.log("Post request fired");
  const longBodyURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const usersURLs = urlsForUser(urlDatabase, userID);

  if (!(shortURL in usersURLs)) {
    return res.status(404).send("You need to be logged in to edit");
  }
  console.log(longBodyURL);
  console.log(shortURL);

  urlDatabase[shortURL].longURL = longBodyURL;

  res.redirect("/urls");
});

// ** What happens when you click on the login button **
app.post('/login', (req, res) => {
  //res.cookie("username", req.body["username"])
  //console.log(req.body)
  const email = req.body.email;
  const password = req.body.password;
 
  if (emailAlreadyExists(usersDatabase, email)) {
    const user = getUserByEmail(usersDatabase, email);  // returns the user info (the key)

    if (bcrypt.compareSync(password, usersDatabase[user].password)) {
      req.session.user_id =  user;
      res.redirect("/urls");
    } else {
      res.status(403).json({message: "Incorrect password"});
    }
    
  } else if (!emailAlreadyExists(usersDatabase, email)) {
    res.status(403).json({message: "That email does not match our records"});
  }
});

// ** What happens when you click on the logout button **
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// ** What happens after the registration form **
app.post('/register', (req,res)=>{

  const email = req.body.email;
  const password = req.body.password;
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  // if email or password is missing
  if (!email || !password) {
    res.status(400).json({message: 'Please enter an email/password'});
  
  //email already exists in database
  } else if (emailAlreadyExists(usersDatabase, email)) {
    res.status(400).json({message: 'Email is already in the system'});
  } else {
    const userID = generateRandomString();
    const storeuser = {
      id: userID,
      email: email,
      password: hashedPassword,
    };

    usersDatabase[userID] = storeuser;
    console.log("Users Database >>  ", usersDatabase);

    req.session.user_id = storeuser.id;
    res.redirect("/urls");
  }
});

// *******************************
// *       LISTENER
// *******************************
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});