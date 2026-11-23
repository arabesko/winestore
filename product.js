// Get products from the server
async function loadProducts() {
    const response = await fetch("/api/products");
    const products = await response.json();

    console.log(products);
}

loadProducts();