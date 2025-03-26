window.onload = function () {
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageBox = document.getElementById('formMessage');
  
    fetch('http://localhost/sis/backend/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Login successful') {
          // Redirect based on role
          const role = data.user.role;
          if (role === 'student') {
            window.location.href = 'dashboard_student.html';
          } else if (role === 'lecturer') {
            window.location.href = 'dashboard_lecturer.html';
          } else if (role === 'admin') {
            window.location.href = 'dashboard_admin.html';
          }
        } else {
          messageBox.textContent = data.message;
        }
      })
      .catch(err => {
        console.error(err);
        messageBox.textContent = "Something went wrong. Please try again.";
      });
  });
}
  // Registration handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("✅ Register form submitted");


    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const course = document.getElementById('course') ? document.getElementById('course').value : '';
   
    console.log("📦 Sending course:", course); 
    const messageBox = document.getElementById('formMessage');
    
    fetch('http://localhost/sis/backend/register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role, course })
    })
    .then(res => res.json())
    .then(data => {
      messageBox.textContent = data.message;
      if (data.message === "User registered successfully") {
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }
    })
    .catch(err => {
      console.error(err);
      messageBox.textContent = "Something went wrong!";
    });
  });
}

// 🔹 RESET PASSWORD HANDLER
const resetForm = document.getElementById('resetPasswordForm');
if (resetForm) {
  resetForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('resetEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const messageBox = document.getElementById('formMessage');

    fetch('http://localhost/sis/backend/reset_password.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, new_password: newPassword })
    })
    .then(res => res.json())
    .then(data => {
      console.log("🔑 Reset password response:", data);
      messageBox.textContent = data.message;
      if (data.message === "Password reset successful") {
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }
    })
    .catch(err => {
      console.error(err);
      messageBox.textContent = "Something went wrong!";
    });
  });
}


  