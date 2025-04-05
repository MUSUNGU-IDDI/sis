 document.addEventListener('DOMContentLoaded', function() {
    // Get user data from sessionStorage
   // const user = JSON.parse(sessionStorage.getItem('user'));
    
    // Redirect to login if no user data
   // if (!user || user.role !== 'student') {
     //   window.location.href = 'index.html';
    //    return;
   // }

    const STUDENT_ID = user.student_id;
    const BASE_URL = 'http://localhost/sis/backend/';
    const ATTENDANCE_THRESHOLD = 75;
  
    // Initialize dashboard
    initDashboard(STUDENT_ID);
  
    async function initDashboard(studentId) {
      setupEventListeners();
      await loadStudentProfile(studentId);
      await loadAnalyticsData(studentId);
    }
  
    async function loadStudentProfile(studentId) {
      try {
          const response = await fetch(`http://localhost/sis/backend/get_students.php?student_id=${studentId}`);
          const data = await response.json();
          
          if (data.success) {
              document.getElementById('studentId').textContent = data.student.student_id;
              document.getElementById('studentName').textContent = data.student.name;
              document.getElementById('studentCourse').textContent = data.student.course || 'Not specified';
              document.getElementById('studentEmail').textContent = data.student.email;
          }
      } catch (error) {
          console.error('Profile load error:', error);
      }
  }
    async function loadAnalyticsData(studentId) {
      try {
        const [gradesRes, attendanceRes] = await Promise.all([
          fetch(`${BASE_URL}get_grades.php?student_id=${studentId}`),
          fetch(`${BASE_URL}get_attendance.php?student_id=${studentId}`)
        ]);
        
        const gradesData = await gradesRes.json();
        const attendanceData = await attendanceRes.json();
        
        renderGradesPieChart(gradesData.data || []);
        populateGradesTable(gradesData.data || []);
        renderAttendanceBarChart(attendanceData.attendance || []);
        updateAttendanceSummary(attendanceData.attendance || []);
        
      } catch (error) {
        console.error('Analytics load error:', error);
        showError('analytics', 'Failed to load analytics data');
      }
    }
  
    function renderGradesPieChart(gradesData) {
      const ctx = document.getElementById('gradesChart').getContext('2d');
      const subjects = gradesData.map(g => g.subject);
      const grades = gradesData.map(g => g.grade);
      
      const gradeColors = {
          'A': '#2ecc71',
          'B': '#3498db',
          'C': '#f1c40f',
          'D': '#e67e22',
          'F': '#e74c3c'
      };
      
      new Chart(ctx, {
          type: 'pie',
          data: {
              labels: subjects,
              datasets: [{
                  data: gradesData.map(g => 1),
                  backgroundColor: grades.map(g => gradeColors[g] || '#95a5a6'),
                  borderWidth: 1
              }]
          },
          options: {
              plugins: {
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              return `${context.label}: ${gradesData[context.dataIndex].grade}`;
                          }
                      }
                  }
              }
          }
      });
    }
  
    function renderAttendanceBarChart(attendanceData) {
      const ctx = document.getElementById('attendanceChart').getContext('2d');
      const labels = attendanceData.map(a => new Date(a.date).toLocaleDateString());
      const data = attendanceData.map(a => a.status === 'Present' ? 1 : 0);
      const colors = attendanceData.map(a => a.status === 'Present' ? '#1cc88a' : '#e74a3b');
      
      new Chart(ctx, {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Attendance',
                  data: data,
                  backgroundColor: colors,
                  borderColor: "#fff",
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true,
                      max: 1,
                      ticks: {
                          callback: function(value) {
                              return value === 1 ? 'Present' : 'Absent';
                          }
                      }
                  }
              }
          }
      });
    }
  
    function updateAttendanceSummary(attendanceData) {
      if (!attendanceData.length) {
          document.getElementById('attendancePercentage').textContent = 'No data';
          return;
      }
      
      const presentCount = attendanceData.filter(a => a.status === 'Present').length;
      const totalCount = attendanceData.length;
      const percentage = Math.round((presentCount / totalCount) * 100);
      
      document.getElementById('attendancePercentage').textContent = `${percentage}%`;
      
      const badge = document.getElementById('eligibilityBadge');
      badge.textContent = percentage >= ATTENDANCE_THRESHOLD ? 'Eligible' : 'Not Eligible';
      badge.className = 'eligibility-badge ' + 
          (percentage >= ATTENDANCE_THRESHOLD ? 'eligible' : 'not-eligible');
    }
  
    function populateGradesTable(gradesData) {
      const tableBody = document.getElementById('gradesTableBody');
      tableBody.innerHTML = '';
      
      if (!gradesData || gradesData.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="3" class="text-muted">No grade data available</td></tr>`;
          return;
      }
      
      const sortedGrades = [...gradesData].sort((a, b) => a.subject.localeCompare(b.subject));
      
      sortedGrades.forEach(grade => {
          const row = document.createElement('tr');
          const gradeClass = grade.grade ? `grade-${grade.grade.toLowerCase()}` : '';
          const gradeDisplay = grade.grade || 'N/A';
          
          row.innerHTML = `
              <td>${grade.subject || 'No subject'}</td>
              <td><span class="grade-badge ${gradeClass}">${gradeDisplay}</span></td>
              <td>${getGradeRemarks(grade.grade)}</td>
          `;
          tableBody.appendChild(row);
      });
    }
  
    function getGradeRemarks(grade) {
      if (!grade) return 'No grade available';
      
      const remarks = {
          'A': 'Excellent (5.0)',
          'B': 'Good (4.0)',
          'C': 'Satisfactory (3.0)',
          'D': 'Poor (2.0)',
          'F': 'Fail (0.0)'
      };
      return remarks[grade.toUpperCase()] || 'No remark available';
    }
  
    function exportGrades() {
      const studentId = document.getElementById('studentId').textContent;
      window.open(`${BASE_URL}export_grades.php?student_id=${studentId}`);
    }
  
    function setupEventListeners() {
      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
          const sectionId = this.dataset.section;
          toggleActiveSection(sectionId);
        });
      });
  
      document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('student_id');
        window.location.href = 'index.html';
      });
  
      document.getElementById('exportGradesBtn')?.addEventListener('click', exportGrades);
    }
  
    function toggleActiveSection(sectionId) {
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
      
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(sectionId).classList.add('active');
    }
  
    function showError(sectionId, message) {
      const section = document.getElementById(sectionId);
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = message;
      section.appendChild(errorElement);
    }
  });