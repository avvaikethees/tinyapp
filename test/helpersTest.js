const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
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

const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "b6hM54" },
  s9m5xK: { longURL:  "http://www.google.com", userID: "b6hM54" },
};

const testResult = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

//------------------------------------------------------------//

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined with a non-existent email', function() {
    const user = getUserByEmail(testUsers, "fake@example.com");
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

//------------------------------------------------------------//

describe('urlsForUser', function() {
  it('should return testResult for user  aJ48IW', function() {
    const userUrls = urlsForUser(testUrlDatabase, "aJ48lW");
    const expectedOutput = testResult;
    assert.deepEqual(userUrls, expectedOutput);
  });

  it('should return not return testResult for user b6hM54', function() {
    const userUrls = urlsForUser(testUrlDatabase, "b6hM54");
    const expectedOutput = testResult;
    assert.notDeepEqual(userUrls, expectedOutput);
  });
});