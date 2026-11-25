
// Create an asynchronous function to load products
async function loadProducts() {

    // Request the products from our Express server
    const response = await fetch("/api/products");

    // Convert the JSON response into JavaScript data
    const products = await response.json();

    // Find the HTML section where products will be displayed (wines.html)
    const container = document.getElementById("products");

    // Go through each product returned from the database
    products.forEach(product => {

        // Add the product information to the HTML page
        container.innerHTML += `
            <div class="product">

                <!-- Display the product image -->
                <img src="${product.image}" alt="${product.name}">

                <!-- Display the product name -->
                <h3>${product.name}</h3>

                <!-- Display the product description -->
                <p>${product.description}</p>

                <!-- Display the product price -->
                <p>€${product.price}</p>

                <!-- Basket functionality will be added later -->
                <button onclick="addToBasket(${product.id})">
                    Add to Basket
                </button>

            </div>
        `;
    });
}

// Send the selected product to the shopping basket
async function addToBasket(productId) {
    try {
        // Send the product ID to the server
        const response = await fetch("/api/basket/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productId })
        });

        // Receive the server response
        const data = await response.json();

        // Display the server message
        alert(data.message);

        // Redirect unauthenticated users to the login page
        if (response.status === 401) {
            window.location.href = "login.html";
        }

    } catch (error) {
        // Handle connection errors
        alert("Error connecting to the server");
    }
}

// Run the function when the script loads
loadProducts();
