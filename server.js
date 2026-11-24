
// Import Express to create the web server
const express = require("express");

// Import the MySQL database connection
const db = require("./db");

// Import bcrypt for secure password hashing
const bcrypt = require("bcrypt");

// Create the Express application
const app = express();

// Allow Express to receive and process JSON data
// sent from the registration form
app.use(express.json());

const PORT = 3000;

app.use(express.static(__dirname));

// Get all products from the database
app.get("/api/products", (req, res) => {

    db.query("SELECT * FROM products", (error, results) => {

        if (error) {
            return res.status(500).json({
                message: "Error loading products"
            });
        }

        res.json(results);
    });

});

// Create a route to register new users
app.post("/api/register", async (req, res) => {
    // Receive the user information from the form
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    // Check that all fields are strings
    if (typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string") {

        return res.status(400).json({
            message: "Invalid data type"
        });
    }

    // Check if any required field is empty
    if (!name.trim() || !email.trim() || !password.trim()) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    // Check the maximum length of name and email
    if (name.trim().length > 100 || email.trim().length > 150) {
        return res.status(400).json({
            message: "Name or email is too long"
        });
    }

    // Check the email format
    if (!email.includes("@") || !email.includes(".")) {
        return res.status(400).json({
            message: "Invalid email address"
        });
    }

    // Check the minimum password length
    if (password.length < 8 || password.length > 15) {
        return res.status(400).json({
            message: "Password must have at least 8 characters and less than 15 characters"
        });
    }

    // Declare the variable for the password hash
    let hashedPassword;

    try {
        // Generate a secure password hash
        hashedPassword = await bcrypt.hash(password, 12);

    } catch (error) {
        // Handle password hashing errors
        return res.status(500).json({
            message: "Error processing password"
        });
    }

    // Prepare the SQL query to insert a new user
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    // Insert the new user into the database
    db.query(sql, [name.trim(), email.trim(), hashedPassword], (error) => {
        
        // Check if the email is already registered
        if (error && error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Check for database errors
        if (error) {
            return res.status(500).json({
                message: "Error registering user"
            });
        }

        // Confirm successful registration
        res.status(201).json({
            message: "Registration successful"
        });

    });

});

// Start the Express server
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});