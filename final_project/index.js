const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const books = require('./router/booksdb.js'); // Aggiornato per riflettere la posizione

const app = express();
const mockApp = express(); // Separate app for mock API

app.use(express.json());
mockApp.use(express.json());

// Session middleware for main app
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        jwt.verify(token, "fingerprint_customer", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Mock API endpoints
mockApp.get('/books', (req, res) => res.send(books));
mockApp.get('/books/isbn/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    res.send(book || null);
});
mockApp.get('/books/author/:author', (req, res) => {
    const booksByAuthor = Object.keys(books)
        .filter(key => books[key].author === req.params.author)
        .map(key => ({ isbn: key, ...books[key] }));
    res.send(booksByAuthor);
});
mockApp.get('/books/title/:title', (req, res) => {
    const booksByTitle = Object.keys(books)
        .filter(key => books[key].title === req.params.title)
        .map(key => ({ isbn: key, ...books[key] }));
    res.send(booksByTitle);
});

// Main app routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start both servers
const PORT = 5000;
const MOCK_PORT = 5001;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
mockApp.listen(MOCK_PORT, () => console.log(`Mock API running on port ${MOCK_PORT}`));