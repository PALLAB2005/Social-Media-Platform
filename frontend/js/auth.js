const backendURL = "http://localhost:5000/api/auth";

// REGISTER - Only handle registration
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${backendURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registered successfully! Login now.");
        window.location.href = "login.html";
      } else {
        alert(data.message || data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed.");
    }
  });
}

// NOTE: Login functionality removed because it's now in login.html directly