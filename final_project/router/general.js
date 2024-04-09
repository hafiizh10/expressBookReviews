const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message:`User ${username} Registered Successfully`});
        }
        else {
            return res.status(400).json({message:`User ${username} Already registered`});
        }
    }
    else {
        return res.status(404).json({message: "Must provide username and password"});
    }
});

function getBooks() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      const bks = await getBooks();
      res.send(JSON.stringify(bks));
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  

function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({status:404, message:`ISBN ${isbn} not found`});
        }
    })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    getByISBN(req.params.isbn)
    .then(
        result => res.send(result),
        error => res.status(error.status).json({message: error.message})
    );
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  getByISBN(req.params.isbn)
  .then(
      result => res.send(result.reviews),
      error => res.status(error.status).json({message: error.message})
  );
});

function getBookListWithPromise(url) {
    return new Promise((resolve, reject) => {
      axios.get(url)
        .then(response => resolve(response.data))
        .catch(error => reject(error));
    });
  }

  async function getBookListAsync(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error; // Re-throw the error for handling in the route
    }
  }

  public_users.get('/promise', function (req, res) {
    try {
      getBookListWithPromise('http://localhost:5000/') 
        .then(bookList => {
          res.json(bookList);
        })
        .catch(error => {
          console.error(error);
          res.status(500).json({ message: "Error retrieving book list" });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unexpected error" });
    }
  });

  public_users.get('/async', async function (req, res) {
    try {
      const bookList = await getBookListAsync('http://localhost:5000/'); //
      res.json(bookList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving book list" });
    }
  });

  public_users.get('/promise/isbn/:isbn', function (req, res) {
    try {
      const requestedIsbn = req.params.isbn;
      getBookListWithPromise("http://localhost:5000/isbn/" + requestedIsbn) 
        .then(book => {
          res.json(book);
        })
        .catch(error => {
          console.error(error);
          res.status(500).json({ message: "Error retrieving book details" });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unexpected error" });
    }
  });

  public_users.get('/async/isbn/:isbn', async function (req, res) {
    try {
      const requestedIsbn = req.params.isbn;
      const book = await getBookListAsync("http://localhost:5000/isbn/" + requestedIsbn);
      res.json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving book details" });
    }
  });

  public_users.get('/promise/author/:author', function (req, res) {
    try {
      const requestedAuthor = req.params.author;
      getBookListWithPromise("http://localhost:5000/author/" + requestedAuthor) 
        .then(book => {
          res.json(book);
        })
        .catch(error => {
          console.error(error);
          res.status(500).json({ message: "Error retrieving book details" });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unexpected error" });
    }
  });

  public_users.get('/async/author/:author', async function (req, res) {
    try {
      const requestedAuthor = req.params.author;
      const book = await getBookListAsync("http://localhost:5000/author/" + requestedAuthor);
      res.json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving book details" });
    }
  });

  public_users.get('/promise/title/:title', function (req, res) {
    try {
      const requestedTitle = req.params.title;
      getBookListWithPromise("http://localhost:5000/title/" + requestedTitle) 
        .then(book => {
          res.json(book);
        })
        .catch(error => {
          console.error(error);
          res.status(500).json({ message: "Error retrieving book details" });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unexpected error" });
    }
  });

  public_users.get('/async/title/:title', async function (req, res) {
    try {
      const requestedTitle = req.params.title;
      const book = await getBookListAsync("http://localhost:5000/title/" + requestedTitle);
      res.json(book);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving book details" });
    }
  });

module.exports.general = public_users;