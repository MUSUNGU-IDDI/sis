// Login handler
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageBox = document.getElementById('formMessage');
    messageBox.textContent = '';
    messageBox.style.display = 'none';

    fetch('http://localhost/sis/backend/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Required for session cookies
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Store user data in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect based on role
            switch(data.user.role) {
                case 'student':
                    window.location.href = 'dashboard_student.html';
                    break;
                case 'lecturer':
                    window.location.href = 'lecturer_dashboard.html';
                    break;
                case 'admin':
                    window.location.href = 'admin_dashboard.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        } else {
            messageBox.textContent = data.message || 'Login failed';
            messageBox.style.display = 'block';
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        messageBox.textContent = "Login service unavailable. Please try again later.";
        messageBox.style.display = 'block';
    });
});

// Registration handler
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const course = document.getElementById('course')?.value || '';
    const messageBox = document.getElementById('formMessage');
    messageBox.textContent = '';
    messageBox.style.display = 'none';
    
    fetch('http://localhost/sis/backend/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role, course })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        messageBox.textContent = data.message;
        messageBox.style.display = 'block';
        
        if (data.success) {
            messageBox.style.color = 'green';
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } else {
            messageBox.style.color = 'red';
        }
    })
    .catch(err => {
        console.error('Registration error:', err);
        messageBox.textContent = "Registration service unavailable. Please try again later.";
        messageBox.style.display = 'block';
        messageBox.style.color = 'red';
    });
});

// Password reset handler
document.getElementById('resetPasswordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('resetEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const messageBox = document.getElementById('formMessage');
    messageBox.textContent = '';
    messageBox.style.display = 'none';

    fetch('http://localhost/sis/backend/reset_password.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, new_password: newPassword })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        messageBox.textContent = data.message;
        messageBox.style.display = 'block';
        
        if (data.success) {
            messageBox.style.color = 'green';
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } else {
            messageBox.style.color = 'red';
        }
    })
    .catch(err => {
        console.error('Password reset error:', err);
        messageBox.textContent = "Password reset service unavailable. Please try again later.";
        messageBox.style.display = 'block';
        messageBox.style.color = 'red';
    });
});