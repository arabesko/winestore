// Get the login form
const loginForm = document.getElementById("loginForm");

// Listen for the form submission
loginForm.addEventListener("submit", async (event) => {

    // Prevent the page from reloading
    event.preventDefault();

    // Get the login credentials from the form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Send the login credentials to the server
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        // Get the response from the server
        const data = await response.json();

        // Display the server message
        alert(data.message);

        // Redirect the user if login is successful
        if (response.ok) {
            window.location.href = "index.html";
        }

    } catch (error) {
        // Handle connection errors
        alert("Error connecting to the server");
    }

});