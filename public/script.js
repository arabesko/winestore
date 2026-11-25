// Function to validate the form
function validateForm() {

    // Get values of the variables from de web form
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var reason = document.getElementById("reason").value;


    // Name validation
    var namePattern = /^[\p{L}\s]+$/u;// Pattern
    if (name == "" || !namePattern.test(name)) {
        alert("Please enter a valid name");
        return false;
    }

    // Email validation
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;   // Pattern
    if (email == "" || !emailPattern.test(email)) {
        alert("Please enter a valid email address");
        return false;
    }

    // phone validation
    var phonePattern = /^\d{8,9}$/; // Pattern
    if (phone == "" || !phonePattern.test(phone)) {
        alert("Please enter a valid phone number");
        return false;
    }

    // Reason validation
    if (reason == "") {
        alert("Message must be filled out");
        return false;
    }

    // Everything is correct
    alert("Form submitted successfully!");
    Form.reset(); //Clear the form after submitted succesfully

    return false;
}