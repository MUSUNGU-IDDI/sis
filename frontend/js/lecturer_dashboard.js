document.addEventListener("DOMContentLoaded", function () {
    // Sidebar Navigation: show a section
    window.showSection = function (sectionId) {
        document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
        document.getElementById(sectionId).classList.add("active");

        // Load data when switching sections
        if (sectionId === "manageGrades") {
            fetchGrades();
        } else if (sectionId === "manageAttendance") {
            fetchAttendance();
        }
    };

    // Handle Logout
    document.querySelector(".logout-btn").addEventListener("click", logout);
    function logout() {
        fetch("../backend/logout.php", { method: "GET" })
            .then(() => window.location.href = "../frontend/index.html")
            .catch(err => console.error("Logout error:", err));
    }

    // Load Charts & Tables
    renderGradeDistributionChart();
    renderAttendanceTrendChart();
    renderPerformanceTable();

    // Handle Course & Class selection form
    document.getElementById("courseClassForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const course = document.getElementById("courseSelect").value;
        const classGroup = document.getElementById("classSelect").value;
        alert(`Loading data for ${course} - ${classGroup}`);
    });

    // Handle Grade Submission
    document.getElementById("gradeForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch("../backend/add_grade.php", {
            method: "POST",
            body: formData
        }).then(response => response.json())
          .then(data => {
              alert(data.message);
              fetchGrades();
          }).catch(err => console.error("Error adding grade:", err));
    });

    // Handle Attendance Submission
    document.getElementById("attendanceForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch("../backend/add_attendance.php", {
            method: "POST",
            body: formData
        }).then(response => response.json())
          .then(data => {
              alert(data.message);
              fetchAttendance();
          }).catch(err => console.error("Error adding attendance:", err));
    });
});

// Fetch & Display Grades
function fetchGrades() {
    fetch("../backend/get_grades.php")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("gradesTableBody");
            tableBody.innerHTML = "";
            data.forEach(grade => {
                const row = `<tr>
                    <td>${grade.student_name}</td>
                    <td>${grade.course}</td>
                    <td>${grade.grade}</td>
                    <td>
                        <button onclick="deleteGrade(${grade.id})">Delete</button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        })
        .catch(err => console.error("Error fetching grades:", err));
}

// Delete Grade
function deleteGrade(gradeId) {
    fetch(`../backend/delete_grade.php?id=${gradeId}`, { method: "GET" })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchGrades();
        })
        .catch(err => console.error("Error deleting grade:", err));
}

// Fetch & Display Attendance
function fetchAttendance() {
    fetch("../backend/get_attendance.php")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("attendanceTableBody");
            tableBody.innerHTML = "";
            data.forEach(att => {
                const row = `<tr>
                    <td>${att.student_name}</td>
                    <td>${att.date}</td>
                    <td>${att.status}</td>
                    <td>
                        <button onclick="deleteAttendance(${att.id})">Delete</button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        })
        .catch(err => console.error("Error fetching attendance:", err));
}

// Delete Attendance
function deleteAttendance(attId) {
    fetch(`../backend/delete_attendance.php?id=${attId}`, { method: "GET" })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchAttendance();
        })
        .catch(err => console.error("Error deleting attendance:", err));
}

// Helper: Grade Distribution Chart
function renderGradeDistributionChart() {
    const ctx = document.getElementById("gradeDistributionChart").getContext("2d");
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ["A", "B", "C", "D", "E", "F"],
            datasets: [{
                data: [10, 20, 30, 15, 10, 5],
                backgroundColor: ["#4CAF50", "#36A2EB", "#FFCE56", "#FF9800", "#9C27B0", "#F44336"],
                borderWidth: 2,
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

// Helper: Attendance Trend Chart
function renderAttendanceTrendChart() {
    const ctx = document.getElementById("attendanceTrendChart").getContext("2d");
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [{
                label: "Attendance (%)",
                data: [85, 90, 80, 95],
                backgroundColor: "#2196F3",
                borderWidth: 2,
                borderColor: "#000",
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 10 }
                }
            }
        }
    });
}

// Helper: Top & Bottom Performers Table
function renderPerformanceTable() {
    const tableBody = document.querySelector("#performanceTable tbody");
    const performers = [
        { name: "Alice", grade: "A" },
        { name: "Bob", grade: "B" },
        { name: "Charlie", grade: "F" },
        { name: "David", grade: "C" },
        { name: "Eve", grade: "D" }
    ];
    tableBody.innerHTML = "";
    performers.forEach(p => {
        const row = `<tr><td>${p.name}</td><td>${p.grade}</td></tr>`;
        tableBody.innerHTML += row;
    });
}
