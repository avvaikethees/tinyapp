const express = require ('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// SERVER SETUP --------------------------------------
const PORT = 8080; // defualt port 8080
const app = express();
app.set("view engine", "ejs");


//MIDDLEWARE --------------------------------------
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

//DATA --------------------------------------
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
}

// FUNCTIONS -------------------------------------------------------

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

//function to check if password is correct
const passwordCheck = (usersDatabase, newPassword) => {
  for (key in usersDatabase) {
    if(usersDatabase[key]["password"]=== newPassword) {
      return true
    }
  }
  return false
};

  //function to grab the userID for an existing email 
  const getUserByEmail = (usersDatabase, logInEmail)=> {
    for (key in usersDatabase){
    if (usersDatabase[key]["email"] === logInEmail) {
      return key
    }
  }
  };

  //function to grab the urls from userID

  const urlsForUser = (urlDatabase, id) => {
    let result = {}; 

    for (const url in urlDatabase) {
      if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url]
    }
  }
  
  return result;
}

// ROUTES --------------------------------------

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
  const usersURLs = urlsForUser(urlDatabase, userID)
  const templateVars = { urls: usersURLs, userID: req.cookies["user_id"], user:usersDatabase[userID]};
  res.render('urls_index', templateVars);
})

app.get('/urls/new', (req, res) => {
  let userID = req.cookies["user_id"]
  const templateVars = {urls: urlDatabase, userID: req.cookies["user_id"], user:usersDatabase[userID]}
  if (userID) {
    res.render('urls_new', templateVars);
 } else {
   res.status(403).redirect("/login");
 }
});

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
  const userID = req.cookies["user_id"]
  urlDatabase[shortURL] = { longURL: longBodyURL, userID: userID };
  //console.log(req.body);
  res.redirect(`/urls/${shortURL}`)
})

//** what happens after you click on that delete button **
app.post("/urls/:shortURL/delete", (req, res) => {

  if (!req.cookies["user_id"]) {
    return res.status(404).send("Need to be logged in");
  }

  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];

  res.redirect("/urls")
})

// ** what happens when you click on the edit button  **
app.post("/urls/:shortURL", (req, res) => {
  console.log("Post request fired")
  const longBodyURL = req.body.newURL
  const shortURL = req.params.shortURL
  const userID = req.cookies["user_id"]
  const usersURLs = urlsForUser(urlDatabase, userID );

  if (!(shortURL in usersURLs)) {
    return res.status(404).send("You need to be logged in to edit");
  }
  console.log(longBodyURL)
  console.log(shortURL)

  urlDatabase[shortURL].longURL= longBodyURL;

  res.redirect("/urls")
})

// ** What happens when you click on the login button **
app.post('/login', (req, res) => {
  //res.cookie("username", req.body["username"])
  //console.log(req.body)
  let email = req.body.email
  let password = req.body.password

  if (emailAlreadyExists(usersDatabase, email)) {
    if (passwordCheck(usersDatabase, password)) {
      let getuserID = getUserByEmail(usersDatabase, email)
      res.cookie("user_id", getuserID)
      res.redirect("/urls")
    }else {
      res.status(403).json({message: "Incorrect password"})
    }
  
  //if email is not part of the database
  } else if (!emailAlreadyExists(usersDatabase, email)) {
    res.status(403).json({message: "That email does not match our records"})
  }
})

// ** What happens when you click on the logout button **
app.post('/logout', (req, res) => {
  res.clearCookie("user_id")
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