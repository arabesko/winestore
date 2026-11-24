
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
                <button>Add to Basket</button>

            </div>
        `;
    });
}

// Run the function when the script loads
loadProducts();
