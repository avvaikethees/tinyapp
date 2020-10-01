const express = require ('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Server Setup --------------------------------------
const PORT = 8080; // defualt port 8080
const app = express();
app.set("view engine", "ejs");


//Middleware --------------------------------------
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

//Data --------------------------------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

//function to generate a random alphanumeric 6 character string 
function generateRandomString () {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

// function to check if email already exists
const emailAlreadyExists = (usersDatabase, newEmail) => {
  for (key in usersDatabase) {
    if (usersDatabase[key]["email"] === newEmail) {
      return true
    }
  }
  return false; 
};

// Routes --------------------------------------
//View -------------------------------------
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
  const userID = req.cookies["user_id"]
  const templateVars = { urls: urlDatabase, userID: req.cookies["user_id"], user:usersDatabase[userID]};
  res.render('urls_index', templateVars);
})

app.get('/urls/new', (req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = {urls: urlDatabase, userID: req.cookies["user_id"], user:usersDatabase[userID]}
  res.render('urls_new', templateVars);
})

app.get('/register', (req, res) => {
  const templateVars = {userID: null}
  res.render('urls_register', templateVars)
})

app.get('/login', (req, res) => {
  const templateVars = {userID: null}
  res.render('urls_login', templateVars)
})

app.get('/urls/:shortURL', (req, res)=> {
  const userID = req.cookies["user_id"]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userID: req.cookies["user_id"], user: usersDatabase[userID]};
  console.log(templateVars)
  res.render("urls_show", templateVars);
})

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL)
})

// Action ----------------------------------------------------
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

// ** what happens when you click on the edit button  **
app.post("/urls/:shortURL", (req, res) => {
  console.log("Post request fired")
  const longURL = req.body.newURL
  const shortURL = req.params.shortURL
  console.log(longURL)
  console.log(shortURL)

  urlDatabase[shortURL]=longURL

  res.redirect("/urls")
})

// ** What happens when you click on the login button **
app.post('/login', (req, res) => {
  //res.cookie("username", req.body["username"])
  //console.log(req.body)
  res.redirect("/urls")
})

// ** What happens when you click on the logout button **
app.post('/logout', (req, res) => {
  //res.clearCookie("username")
  res.redirect("/urls")
})

// ** What happens after the registration form **
app.post('/register', (req,res)=>{

  let email = req.body.email;
  let password = req.body.password;
  // if email or password is missing
  if (!email || !password) {
    res.status(400).json({message: 'Please enter an email/password'})
  
  //email already exists in database
  } else if (emailAlreadyExists(usersDatabase, email)) {
    res.status(400).json({message: 'Email is already in the system'})
  } else {

    const userID = generateRandomString();
    const storeuser = {
      id: userID, 
      email: email,
      password: password,
    }
  

  //this adds the new user to the global users object 
  usersDatabase[userID] = storeuser 
  //console.log(storeuser)
  console.log(usersDatabase)
  
  // setting a user_id cookie containing the user's newly generated ID 
  //res.cookie(name, value)
  res.cookie("user_id", storeuser.id)
  res.redirect("/urls")
  }
})

//setting up the listener -------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 