// Check the current user session
async function checkSession() {

    try {
        // Request the session status from the server
        const response = await fetch("/api/session");

        // Convert the response into a JavaScript object
        const data = await response.json();

        // Get the login navigation link
        const loginLink = document.getElementById("loginLink");

        // Check if the user is authenticated
        if (data.loggedIn && loginLink) {
            loginLink.textContent = "Logout";

            // Listen for the logout click
            loginLink.addEventListener("click", logout);
        }

    } catch (error) {
        // Handle session verification errors
        console.error("Error checking session", error);
    }
}

// Log out the authenticated user
async function logout(event) {

    // Prevent the default link behaviour
    event.preventDefault();

    try {
        // Send a logout request to the server
        const response = await fetch("/api/logout", {
            method: "POST"
        });

        // Get the server response
        const data = await response.json();

        // Redirect the user after successful logout
        if (response.ok) {
            window.location.href = "index.html";
        } else {
            alert(data.message);
        }

    } catch (error) {
        // Handle connection errors
        alert("Error connecting to the server");
    }
}

// Execute the session verification
checkSession();