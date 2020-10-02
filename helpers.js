// function to check if email already exists -----------------------------
const emailAlreadyExists = (database, newEmail) => {
  for (let key in database) {
    if (database[key]["email"] === newEmail) {
      return true;
    }
  }
  return false;
};

//function to grab the userID for an existing email -----------------------------
const getUserByEmail = (database, logInEmail)=> {
  for (let key in database) {
    if (database[key]["email"] === logInEmail) {
      return key;
    }
  }
};

//function to grab the urls from userID -----------------------------
const urlsForUser = (database, id) => {
  let result = {};

  for (let shortUrl in database) {
    if (database[shortUrl].userID === id) {
      result[shortUrl] = database[shortUrl];
    }
  }
  return result;
};

module.exports = { emailAlreadyExists, getUserByEmail, urlsForUser };