
// Get the registration form
const registerForm = document.getElementById("registerForm");

// Listen for the form submission
registerForm.addEventListener("submit", async (event) => {

    // Prevent the page from reloading
    event.preventDefault();

    // Get the information from the form
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check if both passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {

        // Send the user information to the server
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        // Get the response from the server
        const data = await response.json();

        // Display the server message
        alert(data.message);

        // Redirect the user if registration is successful
        if (response.ok) {
            window.location.href = "login.html";
        }

    } catch (error) {

        // Handle connection errors
        alert("Error connecting to the server");

    }

});
