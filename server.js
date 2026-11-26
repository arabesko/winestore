
// Import Express to create the web server
const express = require("express");

// Import the MySQL database connection
const db = require("./db");

// Import bcrypt for secure password hashing
const bcrypt = require("bcrypt");

// Import express-session to manage user sessions
const session = require("express-session");

// Create the Express application
const app = express();

// Allow Express to receive and process JSON data
// sent from the registration form
app.use(express.json());

// Configure user sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }
}));

const PORT = 3000;

// Serve static frontend files from the public folder
app.use(express.static("public"));

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

// Create a route to authenticate users
app.post("/api/login", (req, res) => {

    // Receive the login credentials
    const { email, password } = req.body || {};

    // Check that both credentials are strings
    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Invalid data type" });
    }

    // Check if any required field is empty
    if (!email.trim() || !password.trim()) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Prepare the SQL query to find the user by email
    const sql = "SELECT * FROM users WHERE email = ?";

    // Search for the user in the database
    db.query(sql, [email.trim()], async (error, results) => {

        // Check for database errors
        if (error) {
            return res.status(500).json({
                message: "Error logging in"
            });
        }

        // Check if the user exists
        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Get the user found in the database
        const user = results[0];

        // Declare the variable for the password comparison
        let passwordMatch;

        try {
            // Compare the entered password with the stored hash
            passwordMatch = await bcrypt.compare(password, user.password);

        } catch (error) {
            // Handle password comparison errors
            return res.status(500).json({
                message: "Error processing password"
            });
        }

        // Check if the password is incorrect
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate a new session after authentication
        req.session.regenerate((error) => {

            // Check for session errors
            if (error) {
                return res.status(500).json({
                    message: "Error creating session"
                });
            }

            // Store the authenticated user's information
            req.session.userId = user.id;
            req.session.userName = user.name;

            // Initialise an empty shopping basket
            req.session.basket = [];

            // Confirm successful authentication
            res.status(200).json({
                message: "Login successful"
            });

        });

    });

});

// Check if the user is authenticated
app.get("/api/session", (req, res) => {

    // Check if an active user session exists
    if (req.session.userId) {
        return res.json({
            loggedIn: true,
            userName: req.session.userName
        });
    }

    // Return the status for an unauthenticated user
    res.json({
        loggedIn: false
    });

});

// Create a route to log out users
app.post("/api/logout", (req, res) => {

    // Destroy the current user session
    req.session.destroy((error) => {

        // Check for session destruction errors
        if (error) {
            return res.status(500).json({
                message: "Error logging out"
            });
        }

        // Remove the session cookie from the browser
        res.clearCookie("connect.sid");

        // Confirm successful logout
        res.json({
            message: "Logout successful"
        });

    });

});

// Create a route to add products to the basket
app.post("/api/basket/add", (req, res) => {

    // Check if the user is authenticated
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Please log in to add products"
        });
    }

    // Receive the product ID from the frontend
    const productId = req.body?.productId;

    // Validate the product ID
    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    // Prepare the SQL query to find the product
    const sql = "SELECT id FROM products WHERE id = ?";

    // Search for the product in the database
    db.query(sql, [productId], (error, results) => {

        // Check for database errors
        if (error) {
            return res.status(500).json({
                message: "Error searching for product"
            });
        }

        // Check if the product exists
        if (results.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Search for the product in the basket
        const existingProduct = req.session.basket.find(
            item => item.productId === productId
        );

        // Check if the product is already in the basket
        if (existingProduct) {
            // Increase the product quantity
            existingProduct.quantity++;
        } else {
            // Add a new product to the basket
            req.session.basket.push({
                productId: productId,
                quantity: 1
            });
        }

        // Confirm that the product was added successfully
        res.status(200).json({
            message: "Product added to basket"
        });

    });

});


// Create a route to retrieve the shopping basket
app.get("/api/basket", (req, res) => {

    // Check if the user is authenticated
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Please log in to view your basket"
        });
    }

    // Retrieve the basket from the user session
    const basket = req.session.basket;

    // Check if the basket is empty
    if (basket.length === 0) {
        return res.json({
            items: [],
            total: 0
        });
    }

    // Retrieve products from the database
    db.query("SELECT * FROM products", (error, results) => {

        // Check for database errors
        if (error) {
            return res.status(500).json({
                message: "Error loading basket products"
            });
        }

        // Create an empty array and initialise the total
        const items = [];
        let total = 0;

        // Iterate through the basket
        for (const item of basket) {

            // Find the corresponding product in the database results
            const product = results.find(p => p.id === item.productId);

            // Check if the product exists
            if (product) {

                // Calculate the product subtotal
                const subtotal = Number(product.price) * item.quantity;

                // Add the product details to the array
                items.push({
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: Number(product.price),
                    quantity: item.quantity,
                    subtotal: subtotal
                });

                // Add the subtotal to the basket total
                total += subtotal;
            }
        }

        // Send the basket items and total price
        res.json({
            items: items,
            total: total
        });

    });

});

// Create a route to remove products from the basket
app.post("/api/basket/remove", (req, res) => {

    // Check if the user is authenticated
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Please log in to remove products"
        });
    }

    // Receive the product ID
    const productId = req.body?.productId;

    // Validate the product ID
    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    // Find the product position in the basket
    const index = req.session.basket.findIndex(
        item => item.productId === productId
    );

    // Check if the product exists in the basket
    if (index === -1) {
        return res.status(404).json({
            message: "Product not found in basket"
        });
    }

    // Check if the product has more than one unit
    if (req.session.basket[index].quantity > 1) {
        // Decrease the product quantity by one
        req.session.basket[index].quantity--;
    } else {
        // Remove the product when only one unit remains
        req.session.basket.splice(index, 1);
    }

    // Confirm that one unit was removed successfully
    res.status(200).json({
        message: "Product removed from basket"
    });

});

// Start the Express server
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});