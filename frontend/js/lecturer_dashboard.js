class LecturerDashboard {
    constructor() {
      this.API_BASE_URL = 'http://localhost/sis/backend';
      this.ACTIVE_SECTION_CLASS = 'active';
      this.ACTIVE_NAV_CLASS = 'active';
      this.gradeChart = null;
      this.attendanceChart = null;
      this.debug = true; // Set to false in production
  
      document.addEventListener("DOMContentLoaded", () => this.init());
    }
  
    init() {
      this.cacheDOM();
      this.bindEvents();
      this.initCharts();
      this.showSection('dashboard');
      this.loadInitialData();
    }
  
    cacheDOM() {
      this.$sections = document.querySelectorAll(".section");
      this.$navItems = document.querySelectorAll(".nav-item");
      this.$gradeForm = document.getElementById("gradeForm");
      this.$attendanceForm = document.getElementById("attendanceForm");
      this.$logoutBtn = document.querySelector(".logout-btn");
    }
  
    bindEvents() {
      this.$navItems.forEach(item => {
        item.addEventListener("click", (e) => {
          const sectionId = e.currentTarget.dataset.section;
          this.showSection(sectionId);
        });
      });
  
      this.$logoutBtn?.addEventListener("click", (e) => this.handleLogout(e));
      this.$gradeForm?.addEventListener("submit", (e) => this.handleGradeSubmit(e));
      this.$attendanceForm?.addEventListener("submit", (e) => this.handleAttendanceSubmit(e));
    }
  
    // SECTION MANAGEMENT
    showSection(sectionId) {
      this.$navItems.forEach(item => {
        item.classList.toggle(this.ACTIVE_NAV_CLASS, item.dataset.section === sectionId);
      });
  
      this.$sections.forEach(section => {
        section.classList.toggle(this.ACTIVE_SECTION_CLASS, section.id === sectionId);
      });
  
      switch(sectionId) {
        case 'manageGrades':
          this.fetchGrades();
          this.fetchStudents();
          break;
        case 'manageAttendance':
          this.fetchAttendance();
          this.fetchStudents();
          break;
        case 'analytics':
          this.fetchAnalyticsData();
          break;
      }
    }
  
    // DATA LOADING
    loadInitialData() {
      this.fetchStudents();
    }
  
    initCharts() {
      const initChart = (id, type) => {
        const ctx = document.getElementById(id)?.getContext('2d');
        if (!ctx) {
          if (this.debug) console.warn(`Chart container #${id} not found`);
          return null;
        }
        return new Chart(ctx, {
          type: type,
          data: { labels: [], datasets: [] },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      };
  
      this.gradeChart = initChart('gradeDistributionChart', 'pie');
      this.attendanceChart = initChart('attendanceTrendChart', 'line');
    }
  
    // API COMMUNICATION
   async fetchAPI(endpoint, options = {}) {
    try {
        const url = `${this.API_BASE_URL}/${endpoint}`;
        const response = await fetch(url, {
            credentials: 'include', // THIS IS CRUCIAL
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
  
        const data = await response.json();
        if (this.debug) console.log(`[API] Response from ${endpoint}:`, data);
  
        if (!data?.success) {
          throw new Error(data?.message || "Invalid response format");
        }
  
        return data;
  
      } catch (error) {
        console.error(`[API] Error in ${endpoint}:`, error);
        this.showToast(`Failed to load ${endpoint.replace('.php', '')}`, 'error');
        return { success: false, message: error.message };
      }
    }
  
    // STUDENT MANAGEMENT (FIXED)
    async fetchStudents() {
        try {
          console.log('[Students] Fetching student data...');
          const response = await fetch(`${this.API_BASE_URL}/get_students.php`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          const result = await response.json();
          console.log('[Students] Raw API response:', result);
      
          if (!result.success) {
            throw new Error(result.message || 'API returned unsuccessful response');
          }
      
          // Handle both response formats
          const students = result.students || result.data;
          
          if (!students || !Array.isArray(students)) {
            throw new Error('Students data is not an array');
          }
      
          console.log(`[Students] Received ${students.length} students`);
      
          const selects = [
            document.getElementById("studentSelect"),
            document.getElementById("attendanceStudentSelect")
          ].filter(Boolean);
      
          if (selects.length === 0) {
            console.warn('[Students] Dropdown elements not found');
            return;
          }
      
          selects.forEach(select => {
            // Clear existing options
            select.innerHTML = '';
            
            // Add default option
            const defaultOption = new Option('-- Select Student --', '');
            select.add(defaultOption);
            
            // Add student options
            students.forEach(student => {
              if (!student.student_id || !student.name) {
                console.warn('[Students] Invalid student data:', student);
                return;
              }
              
              const option = new Option(student.name, student.student_id);
              select.add(option);
            });
          });
      
          console.log('[Students] Dropdowns populated successfully');
      
        } catch (error) {
          console.error('[Students] Loading failed:', error);
          
          // Show error in UI
          const selects = [
            document.getElementById("studentSelect"), 
            document.getElementById("attendanceStudentSelect")
          ].filter(Boolean);
          
          selects.forEach(select => {
            select.innerHTML = '<option value="">Error loading students</option>';
          });
          
          this.showToast('Failed to load students. Please try again.', 'error');
        }
      }
    // GRADE MANAGEMENT (FIXED)
    async fetchGrades() {
      try {
        const { success, data, message } = await this.fetchAPI('get_grades.php');
        if (!success) throw new Error(message || 'Failed to fetch grades');
  
        // Handle both response formats: data.grades or just data
        const grades = data.grades || data;
        
        const $tableBody = document.getElementById("gradesTable");
        if (!$tableBody) throw new Error("Grades table not found");
  
        $tableBody.innerHTML = grades && grades.length > 0
          ? grades.map(grade => this.renderGradeRow(grade)).join('')
          : '<tr><td colspan="4">No grades found</td></tr>';
  
      } catch (error) {
        console.error("[Grades] Error:", error);
      }
    }
  
    renderGradeRow(grade) {
      return `
        <tr>
          <td>${this.escapeHtml(grade.student_name || 'N/A')}</td>
          <td>${this.escapeHtml(grade.subject || 'N/A')}</td>
          <td>${this.escapeHtml(grade.grade || 'N/A')}</td>
          <td>
            <button onclick="dashboard.editGrade(${grade.grade_id}, ${grade.student_id}, '${this.escapeAttr(grade.subject)}', '${this.escapeAttr(grade.grade)}')">
              Edit
            </button>
            <button onclick="dashboard.deleteGrade(${grade.grade_id})">
              Delete
            </button>
          </td>
        </tr>
      `;
    }
  
    // ATTENDANCE MANAGEMENT (FIXED)
    async fetchAttendance() {
        try {
          const response = await this.fetchAPI('get_attendance.php');
          
          // Debug log to verify response structure
          console.log('[Attendance] API Response:', response);
      
          // Handle both response formats:
          // 1. {success: true, attendance: [...]}
          // 2. {success: true, data: [...]}
          const attendanceData = response.attendance || response.data;
          
          if (!attendanceData || !Array.isArray(attendanceData)) {
            throw new Error('Invalid attendance data format');
          }
      
          const $tableBody = document.getElementById("attendanceTable");
          if (!$tableBody) throw new Error("Attendance table not found");
      
          $tableBody.innerHTML = attendanceData.length > 0
            ? attendanceData.map(record => this.renderAttendanceRow(record)).join('')
            : '<tr><td colspan="4">No attendance records found</td></tr>';
      
          console.log(`[Attendance] Successfully loaded ${attendanceData.length} records`);
      
        } catch (error) {
          console.error("[Attendance] Error:", error);
          this.showToast("Failed to load attendance records", "error");
          
          // Show error in table
          const $tableBody = document.getElementById("attendanceTable");
          if ($tableBody) {
            $tableBody.innerHTML = '<tr><td colspan="4">Error loading attendance</td></tr>';
          }
        }
      }
  
    renderAttendanceRow(record) {
      return `
        <tr>
          <td>${this.escapeHtml(record.student_name || 'N/A')}</td>
          <td>${new Date(record.date).toLocaleDateString() || 'N/A'}</td>
          <td>${this.escapeHtml(record.status || 'N/A')}</td>
          <td>
            <button onclick="dashboard.editAttendance(${record.attendance_id}, ${record.student_id}, '${this.escapeAttr(record.date)}', '${this.escapeAttr(record.status)}')">
              Edit
            </button>
            <button onclick="dashboard.deleteAttendance(${record.attendance_id})">
              Delete
            </button>
          </td>
        </tr>
      `;
    }
  
    // ANALYTICS (FIXED)
    async fetchAnalyticsData() {
      try {
        const [gradesRes, attendanceRes] = await Promise.all([
          this.fetchAPI('get_grades.php'),
          this.fetchAPI('get_attendance.php')
        ]);
  
        // Process grades data
        if (gradesRes.success) {
          const gradesData = gradesRes.grades || gradesRes.data;
          if (gradesData) {
            this.renderGradeChart(gradesData);
          } else {
            console.warn("[Analytics] No grade data available");
          }
        }
  
        // Process attendance data
        if (attendanceRes.success) {
          const attendanceData = attendanceRes.attendance || attendanceRes.data;
          if (attendanceData) {
            this.renderAttendanceChart(attendanceData);
          } else {
            console.warn("[Analytics] No attendance data available");
          }
        }
  
      } catch (error) {
        console.error("[Analytics] Error:", error);
      }
    }
  
    renderGradeChart(grades) {
        if (!this.gradeChart || !grades?.length) {
          console.warn("[Grade Chart] No data or chart not initialized");
          return;
        }
      
        const gradeCounts = grades.reduce((acc, { grade }) => {
          // Safely handle undefined/null grades
          const letter = (grade?.charAt(0) || 'U').toUpperCase();
          acc[letter] = (acc[letter] || 0) + 1;
          return acc;
        }, {});
      
        const labels = Object.keys(gradeCounts).sort();
        const data = labels.map(label => gradeCounts[label]);
      
        this.gradeChart.data = {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              '#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336', '#9E9E9E'
            ].slice(0, labels.length),
            borderWidth: 1
          }]
        };
        this.gradeChart.update();
      }
  
    renderAttendanceChart(attendance) {
      if (!this.attendanceChart || !attendance) {
        console.warn("[Attendance Chart] No data or chart not initialized");
        return;
      }
  
      // Process into weekly data
      const weeklyData = {};
      attendance.forEach(({ date, status }) => {
        const week = this.getWeekNumber(new Date(date));
        const weekKey = `Week ${week}`;
        weeklyData[weekKey] = weeklyData[weekKey] || { present: 0, total: 0 };
        weeklyData[weekKey].total++;
        if (status === 'Present') weeklyData[weekKey].present++;
      });
  
      const labels = Object.keys(weeklyData).sort();
      const percentages = labels.map(week => {
        const { present, total } = weeklyData[week];
        return Math.round((present / total) * 100);
      });
  
      this.attendanceChart.data = {
        labels: labels,
        datasets: [{
          label: 'Attendance Rate (%)',
          data: percentages,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      };
  
      this.attendanceChart.options.scales = {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      };
  
      this.attendanceChart.update();
    }
  
    getWeekNumber(date) {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const dayDiff = (date - firstDay) / (24 * 60 * 60 * 1000);
      return Math.ceil((dayDiff + firstDay.getDay() + 1) / 7);
    }
  
    // FORM HANDLERS
    async handleGradeSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.$gradeForm);
        
        // Prepare data object with all required fields
        const gradeData = {
          grade_id: formData.get('gradeId') || null,  // null for new grades
          student_id: parseInt(formData.get('student_id')),
          subject: formData.get('subject'),
          grade: formData.get('grade')
        };
      
        // Validation
        if (!gradeData.student_id || !gradeData.subject || !gradeData.grade) {
          this.showToast('Please fill all required fields', 'error');
          return;
        }
      
        try {
          const endpoint = gradeData.grade_id ? 'update_grade.php' : 'add_grade.php';
          const { success, message } = await this.fetchAPI(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(gradeData)
          });
      
          if (success) {
            this.$gradeForm.reset();
            this.fetchGrades();
            this.showToast(message || 'Grade saved successfully!');
          } else {
            throw new Error(message || 'Failed to save grade');
          }
        } catch (error) {
          console.error('[Grade Submit] Error:', error);
          this.showToast(error.message, 'error');
        }
      }
  
      async handleAttendanceSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.$attendanceForm);
        
        // Prepare data object
        const attendanceData = {
          attendance_id: formData.get('attendanceId') || null,
          student_id: parseInt(formData.get('student_id')),
          date: formData.get('date'),
          status: formData.get('status')
        };
      
        // Validation
        if (!attendanceData.student_id || !attendanceData.date || !attendanceData.status) {
          this.showToast('Please fill all required fields', 'error');
          return;
        }
      
        try {
          const endpoint = attendanceData.attendance_id ? 'update_attendance.php' : 'add_attendance.php';
          const response = await fetch(`${this.API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(attendanceData)
          });
      
          // First check if response is JSON
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error('Failed to parse response:', text);
            throw new Error('Invalid server response');
          }
      
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to save attendance');
          }
      
          this.$attendanceForm.reset();
          this.fetchAttendance();
          this.showToast(data.message || 'Attendance saved successfully!');
      
        } catch (error) {
          console.error('[Attendance Submit] Error:', error);
          this.showToast(error.message, 'error');
        }
      }
  
    // CRUD OPERATIONS
    editGrade(gradeId, studentId, subject, grade) {
      document.getElementById("gradeId").value = gradeId;
      document.getElementById("studentSelect").value = studentId;
      document.getElementById("subject").value = subject;
      document.getElementById("gradeInput").value = grade;
    }
  
    async deleteGrade(gradeId) {
        if (!confirm('Are you sure you want to permanently delete this grade?')) return;
        
        try {
          const response = await fetch(`${this.API_BASE_URL}/delete_grade.php?id=${gradeId}`);
          
          // First get the response as text
          const responseText = await response.text();
          
          // Try to parse as JSON, fallback to error message if fails
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse JSON:', responseText);
            throw new Error('Server returned an invalid response');
          }
      
          if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete grade');
          }
      
          this.fetchGrades(); // Refresh the grades list
          this.showToast(result.message || 'Grade deleted successfully');
          
        } catch (error) {
          console.error('[Delete Grade] Error:', error);
          this.showToast(error.message, 'error');
        }
      }
  
    editAttendance(attId, studentId, date, status) {
      document.getElementById("attendanceId").value = attId;
      document.getElementById("attendanceStudentSelect").value = studentId;
      document.getElementById("attendanceDate").value = date.split('T')[0];
      document.getElementById("attendanceStatus").value = status;
    }
  
    async deleteAttendance(attId) {
        if (!confirm('Are you sure you want to delete this attendance record?')) return;
        
        try {
          // First try parsing as JSON, fallback to text if needed
          const response = await fetch(`${this.API_BASE_URL}/delete_attendance.php?id=${attId}`);
          const responseText = await response.text();
          
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse JSON:', responseText);
            throw new Error('Invalid server response');
          }
      
          if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete attendance');
          }
      
          this.fetchAttendance();
          this.showToast(result.message || 'Attendance deleted successfully');
          
        } catch (error) {
          console.error('[Delete Attendance] Error:', error);
          this.showToast(error.message, 'error');
        }
      }
  
    // UTILITIES
    escapeHtml(unsafe) {
      if (!unsafe) return '';
      return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  
    escapeAttr(unsafe) {
      return this.escapeHtml(unsafe).replace(/"/g, "&quot;");
    }
  
    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  
    async handleLogout(e) {
  e?.preventDefault(); // Prevent default if event exists
  
  // Confirm logout action
  if (!confirm('Are you sure you want to log out?')) {
    return;
  }

  try {
    // Show loading state
    this.$logoutBtn.disabled = true;
    this.$logoutBtn.textContent = 'Logging out...';
    
    // Call logout API
    const { success, message } = await this.fetchAPI('logout.php', {
      method: 'POST',
      credentials: 'include' // Ensure cookies are sent if using session cookies
    });

    if (success) {
      // Clear any client-side data
      localStorage.removeItem('lecturerAuthToken');
      sessionStorage.clear();
      
      // Redirect to login page
      window.location.href = "../frontend/index.html";
    } else {
      throw new Error(message || 'Logout failed');
    }
  } catch (error) {
    console.error("[Logout] Error:", error);
    this.showToast(error.message || 'Logout failed. Please try again.', 'error');
    
    // Reset button state
    if (this.$logoutBtn) {
      this.$logoutBtn.disabled = false;
      this.$logoutBtn.textContent = 'Logout';
    }
  }
}
}
  
  // Initialize the dashboard
  const dashboard = new LecturerDashboard();
