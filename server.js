const express = require("express");

const db = require("./db");

const app = express();

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

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});