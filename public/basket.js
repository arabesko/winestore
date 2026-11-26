// Retrieve the shopping basket from the server
async function loadBasket() {

    try {

        // Send a GET request to the basket API
        const response = await fetch("/api/basket");

        // Convert the response into a JavaScript object
        const data = await response.json();

        // Redirect the user if they are not logged in
        if (response.status === 401) {
            alert(data.message);
            window.location.href = "login.html";
            return;
        }

        // Check for other server errors
        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Get the HTML elements
        const basketItems = document.getElementById("basket-items");
        const basketTotal = document.getElementById("basket-total");

        // Check if the basket is empty
        if (data.items.length === 0) {
            basketItems.textContent = "Your basket is empty";
            basketTotal.textContent = "0.00";
            return;
        }

        // Clear the basket container
        basketItems.innerHTML = "";

        // Display each product in the basket
        for (const item of data.items) {
            basketItems.innerHTML += `
                <div class="basket-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="basket-details">
                        <h3>${item.name}</h3>
                        <p>Price: €${item.price.toFixed(2)}</p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Subtotal: €${item.subtotal.toFixed(2)}</p>
                    </div>
                    <!-- Button to remove one unit -->
                    <button class="remove-button"
                        onclick="removeFromBasket(${item.id})">
                        Remove
                    </button>

                </div>
            `;
        }

        // Display the total basket price
        basketTotal.textContent = data.total.toFixed(2);

    } catch (error) {

        // Handle connection errors
        alert("Error connecting to the server");
    }
}
    // Load the basket when the page opens
    loadBasket();

    // Remove one unit from the shopping basket
async function removeFromBasket(productId) {
    try {
        // Send the product ID to the server
        const response = await fetch("/api/basket/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ productId })
        });

        // Receive the server response
        const data = await response.json();

        // Check if the operation failed
        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Refresh the shopping basket
        await loadBasket();

    } catch (error) {
        // Handle connection errors
        alert("Error connecting to the server");
    }
}