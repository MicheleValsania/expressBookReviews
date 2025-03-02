const express = require('express');
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 10: Get all books using Async/Await with Axios
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5001/books');
        // Use JSON.stringify for neat output as per Task 1 hint
        res.status(200).send(JSON.stringify(response.data, null, 2));
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Task 11: Get book details by ISBN using Async/Await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`http://localhost:5001/books/isbn/${isbn}`);
        if (response.data) {
            res.status(200).send(JSON.stringify(response.data, null, 2));
        } else {
            res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
});

// Task 12: Get book details by author using Async/Await with Axios
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const response = await axios.get(`http://localhost:5001/books/author/${author}`);
        if (response.data && response.data.length > 0) {
            res.status(200).send(JSON.stringify(response.data, null, 2));
        } else {
            res.status(404).json({ message: `No books found for author: ${author}` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Task 13: Get book details by title using Async/Await with Axios
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const response = await axios.get(`http://localhost:5001/books/title/${title}`);
        if (response.data && response.data.length > 0) {
            res.status(200).send(JSON.stringify(response.data, null, 2));
        } else {
            res.status(404).json({ message: `No books found with title: ${title}` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

// Existing endpoints (unchanged for Tasks 10-13)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn]; // Assuming books is still needed locally for this
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (users[username]) {
        return res.status(409).json({ message: `Username ${username} already exists` });
    }
    users[username] = { username: username, password: password };
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

module.exports.general = public_users;