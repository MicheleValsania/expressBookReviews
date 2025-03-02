const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Cambiato da "../booksdb.js" a "./booksdb.js" (relativo a router/)
const regd_users = express.Router();

let users = [];
users["testuser"] = {
    username: "testuser",
    password: "testpassword"
};

const isValid = (username) => { // returns boolean
    return username !== undefined && username.trim().length > 0 && typeof username === 'string';
}

const authenticatedUser = (username, password) => { // returns boolean
    if (!username || !password) return false;
    
    // Search for the user in the users object
    const user = users[username];
    if (user && user.password === password) {
        return true;
    }
    return false;
}

regd_users.post("/login", (req, res) => {
    // Extract username and password from the request
    const { username, password } = req.body;
    
    // Verify that username and password are valid
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Authenticate the user
    if (authenticatedUser(username, password)) {
        // Create a JWT token
        const token = jwt.sign(
            { username: username },
            "fingerprint_customer", // Secret key for the session
            { expiresIn: "1h" } // Token expires after 1 hour
        );
        
        // Save the token in the session
        req.session.authorization = { 
            accessToken: token 
        };
        req.session.user = username;
        
        // Return the token as a response
        return res.status(200).json({
            message: "Login successful",
            token: token,
            username: username
        });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
// In auth_users.js
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    // Check if a book with this ISBN exists
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    
    // Get the review from the request query
    const review = req.query.review;
    
    // Check that the review is provided
    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }
    
    // Get the username from the session (via JWT middleware)
    const username = req.user.username;
    
    // Initialize the reviews object if it doesn't exist
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    
    // For your current structure, we'll convert it to an object with username as key
    // This makes it easier to manage individual user reviews
    if (Array.isArray(books[isbn].reviews)) {
        // Convert existing array to object format if needed
        const reviewsObj = {};
        books[isbn].reviews.forEach(review => {
            reviewsObj[review.username] = review.review;
        });
        books[isbn].reviews = reviewsObj;
    }
    
    // Check if this user already has a review
    if (books[isbn].reviews[username]) {
        // Update existing review
        books[isbn].reviews[username] = review;
        return res.status(200).json({
            message: "Review updated successfully",
            isbn: isbn,
            review: {
                username: username,
                review: review
            }
        });
    } else {
        // Add new review
        books[isbn].reviews[username] = review;
        return res.status(201).json({
            message: "Review added successfully",
            isbn: isbn,
            review: {
                username: username,
                review: review
            }
        });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    
    // Check if the book has reviews
    if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
        return res.status(404).json({ message: `No reviews found for book with ISBN ${isbn}` });
    }
    
    // Get the username from the authenticated session
    const username = req.user.username;
    
    // Check if this user has a review for this book
    if (books[isbn].reviews[username]) {
        // Delete the user's review
        delete books[isbn].reviews[username];
        return res.status(200).json({
            message: `Review by ${username} for book with ISBN ${isbn} deleted successfully`
        });
    } else {
        return res.status(404).json({
            message: `No review found by ${username} for book with ISBN ${isbn}`
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;