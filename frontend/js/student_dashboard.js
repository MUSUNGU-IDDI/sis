document.addEventListener("DOMContentLoaded", function () {
    fetch('../backend/fetch_student_data.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Student profile
          document.getElementById("profileName").textContent = data.profile.name;
          document.getElementById("profileRegNo").textContent = data.profile.reg_no;
          document.getElementById("profileCourse").textContent = data.profile.course || "Not Selected";
  
          // Show course update form if course is empty
          if (!data.profile.course || data.profile.course.trim() === "") {
            document.getElementById("courseUpdateSection").style.display = "block";
          }
  
          // Render grades (3D Pie Chart)
          renderGrades(data.grades);
  
          // Render attendance (3D Bar Chart)
          renderAttendance(data.attendance);
        } else {
          alert("Failed to load student data.");
        }
      });
  
    // Handle course update
    const courseForm = document.getElementById("courseForm");
    if (courseForm) {
      courseForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const course = document.getElementById("course").value;
  
        fetch("../backend/update_course.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ course })
        })
          .then(res => res.json())
          .then(response => {
            document.getElementById("courseUpdateMessage").textContent = response.message;
            if (response.success) {
              document.getElementById("profileCourse").textContent = course;
              document.getElementById("courseUpdateSection").style.display = "none";
            }
          });
      });
    }
  
    // Load notifications
    fetch('../backend/fetch_notifications.php')
      .then(res => res.json())
      .then(notifications => {
        const list = document.getElementById("notificationList");
        list.innerHTML = '';
        if (notifications.length > 0) {
          notifications.forEach(note => {
            const li = document.createElement("li");
            li.textContent = note.message;
            list.appendChild(li);
          });
        } else {
          list.innerHTML = "<li>No notifications available.</li>";
        }
      });
  
    // Export report
    const exportBtn = document.getElementById("downloadReportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
  
        doc.text("Academic Report", 20, 20);
        doc.text("Name: " + document.getElementById("profileName").textContent, 20, 30);
        doc.text("Reg No: " + document.getElementById("profileRegNo").textContent, 20, 40);
        doc.text("Course: " + document.getElementById("profileCourse").textContent, 20, 50);
  
        doc.text("Grades:", 20, 70);
        const gradeTable = document.getElementById("gradesTable");
        let y = 80;
        for (let i = 1; i < gradeTable.rows.length; i++) {
          const row = gradeTable.rows[i];
          const subject = row.cells[0].textContent;
          const grade = row.cells[1].textContent;
          doc.text(`${subject}: ${grade}`, 25, y);
          y += 10;
        }
  
        doc.text("Attendance Percentage: " + document.getElementById("attendancePercentage").textContent + "%", 20, y + 10);
        doc.text("Exam Eligibility: " + document.getElementById("examEligibilityStatus").textContent, 20, y + 20);
  
        doc.save("Academic_Report.pdf");
      });
    }
  });
  
  // === Helper Functions ===
  
  function renderGrades(gradesData) {
    const subjects = gradesData.map(row => row.subject);
    const gradeValues = gradesData.map(row => gradeToNumeric(row.grade));
  
    // 3D Pie Chart for Grades
    new Chart(document.getElementById("gradesChart"), {
      type: 'pie',
      data: {
        labels: subjects,
        datasets: [{
          data: gradeValues,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0'],
          borderWidth: 1,
          hoverOffset: 10 // Creates a 3D effect when hovered
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const gradeLabels = ['F', 'E', 'D', 'C', 'B', 'A'];
                return `${subjects[tooltipItem.dataIndex]}: ${gradeLabels[gradeValues[tooltipItem.dataIndex]]}`;
              }
            }
          }
        }
      }
    });
  
    // Grades Table
    const tbody = document.getElementById("gradesTableBody");
    tbody.innerHTML = '';
    gradesData.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.subject}</td><td>${row.grade}</td>`;
      tbody.appendChild(tr);
    });
  }
  
  function gradeToNumeric(grade) {
    const map = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
    return map[grade.toUpperCase()] || 0;
  }
  
  function renderAttendance(attendanceData) {
    const total = attendanceData.length;
    const present = attendanceData.filter(r => r.status === "Present").length;
    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
    document.getElementById("attendancePercentage").textContent = attendancePercentage;
  
    const eligibility = attendancePercentage >= 75 ? "✅ Eligible for Exams" : "❌ Not Eligible for Exams";
    const badge = document.getElementById("examEligibilityStatus");
    badge.textContent = eligibility;
    badge.style.background = attendancePercentage >= 75 ? "#c8e6c9" : "#ffcdd2";
    badge.style.color = attendancePercentage >= 75 ? "#256029" : "#c62828";
  
    // 3D Bar Chart for Attendance
    new Chart(document.getElementById("attendanceBarChart"), {
      type: 'bar',
      data: {
        labels: ['Attendance %'],
        datasets: [{
          label: 'Attendance Percentage',
          data: [attendancePercentage],
          backgroundColor: attendancePercentage >= 75 ? '#2196F3' : '#F44336',
          borderWidth: 1,
          borderColor: '#000',
          hoverBorderWidth: 3, // Adds a 3D effect
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              display: true
            },
            ticks: {
              stepSize: 10
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return `Attendance: ${tooltipItem.raw}%`;
              }
            }
          }
        }
      }
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            fetch("../backend/logout.php")
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = "../frontend/index.html"; // Redirect to login
                    } else {
                        alert("Logout failed!");
                    }
                })
                .catch(error => console.error("Logout error:", error));
        });
    }
});

  