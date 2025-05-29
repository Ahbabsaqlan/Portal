
document.addEventListener('DOMContentLoaded', function() {
    // --- Login/Logout Elements ---
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginMessage = document.getElementById('login-message');
    const portalMainContainer = document.getElementById('portal-main-container');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Login/Logout Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = loginUsernameInput.value.trim();
            const password = loginPasswordInput.value;

            // Simulate login check (replace with actual authentication)
            if (username === "21-123456-1" && password === "password") {
                loginMessage.textContent = "";
                loginOverlay.style.display = 'none';
                portalMainContainer.style.display = 'flex'; // Show main portal
                if(logoutBtn) logoutBtn.style.display = 'inline-flex'; // Show logout button
                
                // Trigger initial page load for dashboard after login
                showPage('#dashboard');
                setActiveLink('#dashboard');
                if(typeof loadDashboardData === 'function') loadDashboardData();


            } else {
                loginMessage.textContent = "Invalid Student ID or Password.";
                loginPasswordInput.value = ""; // Clear password field on error
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            portalMainContainer.style.display = 'none'; // Hide main portal
            loginOverlay.style.display = 'flex'; // Show login page
            logoutBtn.style.display = 'none'; // Hide logout button
            loginUsernameInput.value = ""; // Clear login form
            loginPasswordInput.value = "";
            loginMessage.textContent = "";
            // Optionally, clear session/local storage if used for "remember me"
        });
    }


    // --- Global State & Configuration (Existing Portal Logic) ---
    const currentAcademicSemesterKey = "spring2024"; 
    const studentID = "21-123456-1"; 
    const semesterNames = {
        "spring2024": "Spring 2023-2024",
        "fall2023": "Fall 2022-2023",
        "summer2023": "Summer 2022-2023"
    };

    let studentRegisteredCourses = [
        { semester: "spring2024", courseCode: "CSE3205", title: "Software Engineering", credit: 3.0, section: "A", time: "TTh 10:00-11:30", room: "D-502", faculty: "Dr. Rahman", grade: "IP", gradePoint: null },
        { semester: "spring2024", courseCode: "CSE3107", title: "Database Systems", credit: 3.0, section: "B", time: "ST 12:00-01:30", room: "C-303", faculty: "Prof. Khan", grade: "IP", gradePoint: null },
        { semester: "spring2024", courseCode: "MAT3109", title: "Numerical Methods", credit: 3.0, section: "C", time: "M 09:00-10:30", room: "B-102", faculty: "Dr. Hasan", grade: "IP", gradePoint: null },
        { semester: "fall2023", courseCode: "CSE2201", title: "Object Oriented Programming", credit: 3.0, section: "B", time: "MW 08:30-10:00", room: "C-401", faculty: "Dr. Akhtar", grade: "A+", gradePoint: 4.00 },
        { semester: "fall2023", courseCode: "EEE2104", title: "Electronic Devices", credit: 3.0, section: "A", time: "ST 10:00-11:30", room: "E-301", faculty: "Prof. Barua", grade: "A-", gradePoint: 3.75 },
    ];
    let courseDropRequests = []; 
    let tempSelectedCourses = []; // NEW: For courses selected before confirmation
    
    const allPages = document.querySelectorAll('.page-content, #dashboard');
    const navLinks = document.querySelectorAll('.nav-menu a, .sidebar-menu a, .user-profile a, .application-card.data-nav-link, .action-buttons a.btn.data-nav-link');
    const courseModal = document.getElementById('course-modal');
    const closeModalBtn = courseModal.querySelector('.close-modal');
    const modalTabs = courseModal.querySelectorAll('.modal-tab');
    const courseModalTitleText = document.getElementById('course-modal-title-text');

    // --- Page Navigation ---
    function showPage(pageIdToShow) {
        allPages.forEach(page => page.style.display = 'none');
        const targetPage = document.querySelector(pageIdToShow);
        
        if (targetPage) {
            targetPage.style.display = 'block';
            if (pageIdToShow === '#registered-courses' && document.getElementById('registered-courses-semester-filter')) {
                renderRegisteredCoursesTable(document.getElementById('registered-courses-semester-filter').value);
            } else if (pageIdToShow === '#academic-results' && document.getElementById('results-semester-filter')) {
                    renderAcademicResults(document.getElementById('results-semester-filter').value);
            } else if (pageIdToShow === '#drop-course-application-page') {
                renderDropApplicationPage();
            } else if (pageIdToShow === '#applications-page') {
                updateApplicationStatusCard();
            } else if (pageIdToShow === '#class-schedule-page' && document.getElementById('class-schedule-semester')) {
                loadClassSchedule(document.getElementById('class-schedule-semester').value);
            } else if (pageIdToShow === '#academic-calendar-page') {
                generateCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
            } else if (pageIdToShow === '#registration-schedule') {
                renderSelectedCoursesForRegistration(); // Render initially empty or with temp items
                displayProgramCourses();
                if (offeredSectionsView) offeredSectionsView.style.display = 'none';
                if (registrationMainView) registrationMainView.style.display = 'block';
            } else if (pageIdToShow === '#dashboard') {
                loadDashboardData(); 
            }
        } else if (pageIdToShow === '#dashboard' || pageIdToShow === '#') {
            const dashboardPage = document.getElementById('dashboard');
            if (dashboardPage) dashboardPage.style.display = 'block';
            loadDashboardData();
        } else { 
            console.warn(`Page with ID ${pageIdToShow} not found. Defaulting to dashboard.`);
            const dashboardPage = document.getElementById('dashboard');
                if (dashboardPage) dashboardPage.style.display = 'block';
            loadDashboardData();
            setActiveLink('#dashboard'); 
        }
        window.scrollTo(0, 0);
    }

    function setActiveLink(targetId) {
        if (targetId === '#') targetId = '#dashboard';
        navLinks.forEach(lnk => lnk.classList.remove('active'));
        document.querySelectorAll(`.nav-menu a[href="${targetId}"], .sidebar-menu a[href="${targetId}"], .application-card.data-nav-link[href="${targetId}"], .action-buttons a.btn.data-nav-link[href="${targetId}"]`).forEach(actLink => actLink.classList.add('active'));
        const userProfileIconParent = document.querySelector('.user-profile');
        if (userProfileIconParent) {
            userProfileIconParent.classList.toggle('active-parent', targetId === '#profile');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            let targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                if (targetId === '#') targetId = '#dashboard';
                showPage(targetId);
                setActiveLink(targetId);
                window.location.hash = targetId; 
            }
        });
    });
    
    // --- Mock Data & Helper Functions ---
    const weeklySchedulesData = { 
        "spring2024": [ 
            { day: "Sunday", icon: "fa-sun", classes: [] }, 
            { day: "Monday", icon: "fa-cloud", classes: [] }, 
            { day: "Tuesday", icon: "fa-calendar-day", current: true, classes: [] }, 
            { day: "Wednesday", icon: "fa-cloud-sun", classes: [] }, 
            { day: "Thursday", icon: "fa-cloud-rain", classes: [] } 
        ],
        "fall2023": [ { day: "Monday", icon: "fa-sun", classes: [ { code: "CSE2201", title: "OOP", time: "MW 08:30-10:00", room: "D-101", type: "lecture" } ] }, { day: "Wednesday", icon: "fa-calendar-day", classes: [ { code: "EEE2104", title: "Electronic Devices", time: "ST 10:00-11:30", room: "E-301", type: "lecture" } ] }, ],
        "summer2023": [ { day: "Tuesday", icon: "fa-cloud", classes: [ { code: "ENG101", title: "English I", time: "TTh 11:00-12:30", room: "E-205", type: "lecture" } ] }, ]
    };
    const coursesData = { 
        "CSE3205": { title: "Software Engineering", credit: 3.0, section: "A", desc: "Fundamental principles and practices of software engineering...", time: "TTh 10:00-11:30", room: "D-502", facultyName: "Dr. Rahman", assessments: [{type: "Midterm", weight:"25%", score:"IP", max:"25"}, {type: "Final", weight:"40%", score:"IP", max:"40"}, {type:"Quizzes", weight:"15%", score:"IP", max:"15"}, {type:"Project", weight:"20%", score:"IP", max:"20"}]},
        "CSE3107": { title: "Database Systems", credit: 3.0, section: "B", desc: "Core concepts of database systems...", time: "ST 12:00-01:30", room: "C-303", facultyName: "Prof. Khan", assessments: [{type: "Midterm", weight:"30%", score:"IP", max:"30"}, {type: "Final", weight:"40%", score:"IP", max:"40"}, {type:"Assignments", weight:"30%", score:"IP", max:"30"}]},
        "MAT3109": { title: "Numerical Methods", credit: 3.0, section: "C", desc: "Numerical techniques for solving mathematical problems...", time: "M 09:00-10:30", room: "B-102", facultyName: "Dr. Hasan", assessments: []},
        "CSE3111": { title: "Computer Networks", credit: 3.0, section: "C", desc: "Introduction to computer networks...", time: "ST 02:00-03:30", room: "B-407", facultyName: "Dr. Islam", assessments: []},
        "CSE3203": { title: "Algorithms", credit: 3.0, section: "A", desc: "Design and analysis of algorithms...", time: "ST 04:00-05:30", room: "A-205", facultyName: "Prof. Ahmed", assessments: []},
        "CSE3205L": { title: "Software Engineering Lab", credit: 1.0, section: "L1", desc: "Lab sessions for SE...", time: "W 01:00-03:00", room: "Lab-5", facultyName: "Mr. X", assessments: []},
        "CSE3111L": { title: "Computer Networks Lab", credit: 1.0, section: "L2", desc: "Lab sessions for Networks...", time: "Th 09:00-11:00", room: "Lab-3", facultyName: "Ms. Y", assessments: []},
        "CSE2201": { title: "Object Oriented Programming", credit: 3.0, section: "B", desc: "OOP concepts...", time: "MW 08:30-10:00", room: "C-401", facultyName: "Dr. Akhtar", assessments: [{type: "Midterm", weight:"25%", score:"23", max:"25"}, {type: "Final", weight:"40%", score:"38", max:"40"}]},
        "EEE2104": { title: "Electronic Devices & Circuits", credit: 3.0, section: "A", desc: "Study of electronic devices...", time: "ST 10:00-11:30", room: "E-301", facultyName: "Prof. Barua", assessments: [{type: "Midterm", weight:"30%", score:"25", max:"30"}, {type: "Final", weight:"50%", score:"42", max:"50"}]},
        "PHY1101": { title: "Physics I", credit: 3.0, section: "A", desc: "Fundamental physics concepts...", time: "MW 09:00-10:30", room: "P-101", facultyName: "Dr. Z", assessments: [] },
        "ENG101": { title: "English I", credit: 3.0, section: "E", desc: "Basic English skills...", time: "TTh 11:00-12:30", room: "E-101", facultyName: "Ms. W", assessments: [] },
        "CSE1101": { title: "Introduction to Computer Studies", credit: 1.0, desc: "Basic computer literacy...", facultyName:"TBA", assessments: []},
        "CSE1203": { title: "Programming Language I (Java)", credit: 3.0, desc: "Fundamentals of programming using Java.", facultyName:"TBA", assessments: []},
        "MAT1102": { title: "Differential Calculus & Co-ordinate Geometry", credit: 3.0, desc: "Calculus and analytical geometry.", facultyName:"TBA", assessments: []},
        "ENG1101": { title: "English Reading & Speaking", credit: 3.0, desc: "Developing English reading and oral communication skills.", facultyName:"TBA", assessments: []},
        "CSE2108": { title: "Data Structures", credit: 3.0, desc: "Fundamental data structures...", facultyName:"TBA", assessments: []},
        "CSE2215": { title: "Computer Architecture", credit: 3.0, desc: "Organization and architecture of computer systems.", facultyName:"TBA", assessments: []},
        "CSE4100": { title: "Web Technologies", credit: 3.0, desc: "Client-side and server-side web development.", facultyName:"TBA", assessments: []},
        "CSE4200": { title: "Artificial Intelligence", credit: 3.0, desc: "Introduction to AI concepts...", facultyName:"TBA", assessments: []},
    };
    const programCoursesData = [ 
        { code: "CSE1101", title: "Introduction to Computer Studies", credits: 1.0 }, { code: "CSE1203", title: "Programming Language I (Java)", credits: 3.0 },
        { code: "MAT1102", title: "Differential Calculus & Co-ordinate Geometry", credits: 3.0 }, { code: "PHY1101", title: "Physics I", credits: 3.0 },
        { code: "ENG1101", title: "English Reading & Speaking", credits: 3.0 }, { code: "CSE2108", title: "Data Structures", credits: 3.0 },
        { code: "CSE2215", title: "Computer Architecture", credits: 3.0 }, { code: "EEE2104", title: "Electronic Devices & Circuits", credits: 3.0 },
        { code: "CSE3205", title: "Software Engineering", credits: 3.0 }, { code: "CSE3107", title: "Database Systems", credits: 3.0 },
        { code: "CSE3111", title: "Computer Networks", credits: 3.0 }, { code: "CSE3203", title: "Algorithms", credits: 3.0 },
        { code: "MAT3109", title: "Numerical Methods", credits: 3.0 }, { code: "CSE4100", title: "Web Technologies", credits: 3.0 },
        { code: "CSE4200", title: "Artificial Intelligence", credits: 3.0 },
    ];
    const allOfferedSectionsData = [ 
        { courseCode: "CSE3205", section: "A", time: "TTh 10:00-11:30", room: "D-502", faculty: "Dr. Rahman", enrolled: 35, capacity: 40 },
        { courseCode: "CSE3205", section: "B", time: "MW 02:00-03:30", room: "D-503", faculty: "Dr. Eva", enrolled: 20, capacity: 40 },
        { courseCode: "CSE3205", section: "C", time: "ST 08:30-10:00", room: "D-504", faculty: "Mr. Kabir", enrolled: 39, capacity: 40 },
        { courseCode: "CSE3107", section: "B", time: "ST 12:00-01:30", room: "C-303", faculty: "Prof. Khan", enrolled: 38, capacity: 40 }, 
        { courseCode: "CSE3107", section: "C", time: "TTh 08:30-10:00", room: "C-304", faculty: "Mr. Alam", enrolled: 15, capacity: 35 },
        { courseCode: "MAT3109", section: "C", time: "M 09:00-10:30", room: "B-102", faculty: "Dr. Hasan", enrolled: 25, capacity: 30 }, 
        { courseCode: "PHY1101", section: "D", time: "TTh 01:00-02:30", room: "A-101", faculty: "Prof. Alam", enrolled: 40, capacity: 40 },
        { courseCode: "PHY1101", section: "E", time: "MW 10:00-11:30", room: "A-102", faculty: "Dr. Selim", enrolled: 25, capacity: 30 },
        { courseCode: "CSE1203", section: "F", time: "ST 04:00-05:30", room: "B-201", faculty: "Ms. Nadia", enrolled: 30, capacity: 35 },
        { courseCode: "CSE1203", section: "G", time: "MW 11:30-01:00", room: "B-202", faculty: "Mr. Fahim", enrolled: 33, capacity: 35 },
        { courseCode: "CSE4100", section: "H", time: "TTh 02:30-04:00", room: "Lab-7", faculty: "Dr. Zaman", enrolled: 18, capacity: 25 },
        { courseCode: "MAT1102", section: "J", time: "MW 01:00-02:30", room: "Annex-101", faculty: "Dr. Binte", enrolled: 0, capacity: 30 },
        { courseCode: "MAT1102", section: "K", time: "ST 02:30-04:00", room: "Annex-102", faculty: "Mr. Rony", enrolled: 5, capacity: 30 },
        { courseCode: "ENG1101", section: "L", time: "TTh 11:30-01:00", room: "Main-E201", faculty: "Ms. Shila", enrolled: 10, capacity: 25 },
            { courseCode: "CSE2108", section: "M", time: "ST 01:00-02:30", room: "D-202", faculty: "Dr. Hasan", enrolled: 28, capacity: 35 },
        { courseCode: "CSE2108", section: "N", time: "MW 04:00-05:30", room: "D-203", faculty: "Ms. Tania", enrolled: 12, capacity: 35 },
        { courseCode: "EEE2104", section: "P", time: "TTh 04:00-05:30", room: "E-105", faculty: "Prof. Barua", enrolled: 30, capacity: 30 }, 
        { courseCode: "CSE4200", section: "Q", time: "M 02:00-05:00", room: "Lab-AI", faculty: "Dr. Alpha", enrolled: 0, capacity: 20 }, 
        { courseCode: "CSE4200", section: "R", time: "W 09:00-12:00", room: "Lab-AI", faculty: "Dr. Beta", enrolled: 3, capacity: 20 },
    ];

    // --- Toast Notification ---
    const toastEl = document.getElementById('toast-notification');
    function showToast(message, type = 'info') { 
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.className = 'toast-notification'; 
        toastEl.classList.add(type);
        toastEl.classList.add('show');
        setTimeout(() => { toastEl.classList.remove('show'); }, 3500);
    }

    // --- Dashboard Update Functions ---
    const dashboardScheduleContainer = document.getElementById('dashboard-schedule-content');
    const dashboardCurrentSemesterDisplay = document.getElementById('dashboard-current-semester-display');
    const dashboardQuickStatsContainer = document.getElementById('dashboard-quick-stats');

    function updateDashboardQuickStats() {
        if (!dashboardQuickStatsContainer) return;

        const currentSemesterCourses = studentRegisteredCourses.filter(c => c.semester === currentAcademicSemesterKey);
        const totalCurrentCredits = currentSemesterCourses.reduce((sum, course) => sum + course.credit, 0);
        
        let totalGradePoints = 0;
        let totalCreditsForCgpa = 0;
        studentRegisteredCourses.forEach(course => {
            if (course.gradePoint !== null && course.grade !== "IP") {
                totalGradePoints += course.gradePoint * course.credit;
                totalCreditsForCgpa += course.credit;
            }
        });
        const cgpa = totalCreditsForCgpa > 0 ? (totalGradePoints / totalCreditsForCgpa).toFixed(2) : "N/A";

        dashboardQuickStatsContainer.querySelector('[data-stat="cgpa"]').textContent = cgpa;
        dashboardQuickStatsContainer.querySelector('[data-stat="credits"]').textContent = totalCurrentCredits.toFixed(1);
    }
    
    function loadDashboardData() {
        if(dashboardScheduleContainer) {
                dashboardScheduleContainer.innerHTML = generateScheduleHTML(weeklySchedulesData[currentAcademicSemesterKey], currentAcademicSemesterKey);
                attachModalListenersToScheduleItems(dashboardScheduleContainer);
        }
        if (dashboardCurrentSemesterDisplay) {
            dashboardCurrentSemesterDisplay.textContent = semesterNames[currentAcademicSemesterKey] || currentAcademicSemesterKey;
        }
        updateDashboardQuickStats();
    }


    function generateScheduleHTML(scheduleDataForSemester, semesterKey) {
        let baseSchedule = scheduleDataForSemester ? JSON.parse(JSON.stringify(scheduleDataForSemester)) : [];
        let currentRegisteredForThisSemester = studentRegisteredCourses.filter(c => c.semester === semesterKey);
        
        currentRegisteredForThisSemester.forEach(regCourse => {
            const timeSlot = parseTimeSlot(regCourse.time); 
            if (timeSlot) {
                timeSlot.days.forEach(dayIndex => {
                    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
                    let dayInfo = baseSchedule.find(d => d.day === dayName);
                    if (!dayInfo) { 
                        dayInfo = { day: dayName, icon: "fa-calendar-alt", classes: [] }; 
                        baseSchedule.push(dayInfo);
                    }
                    if (!dayInfo.classes.some(c => c.code === regCourse.courseCode && c.time === regCourse.time)) {
                        dayInfo.classes.push({ 
                            code: regCourse.courseCode, 
                            title: regCourse.title, 
                            time: regCourse.time, 
                            room: regCourse.room, 
                            type: regCourse.courseCode.toUpperCase().includes('L') ? 'lab' : 'lecture' 
                        });
                    }
                });
            }
        });

        baseSchedule.sort((a,b) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(a.day) - ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(b.day));

        if (baseSchedule.every(d => d.classes.length === 0)) return '<p class="no-results" style="text-align:center; padding:1rem;">No schedule available for this semester.</p>';
        
        let html = '';
        baseSchedule.forEach(dayInfo => {
            if (dayInfo.classes && dayInfo.classes.length > 0) { 
                html += `<div class="schedule-day"><div class="day-header ${dayInfo.current ? 'current-day' : ''}"><i class="fas ${dayInfo.icon || 'fa-calendar-day'}"></i> ${dayInfo.day} ${dayInfo.current ? '(Today)' : ''}</div>`;
                dayInfo.classes.sort((a,b) => { 
                    const slotA = parseTimeSlot(a.time);
                    const slotB = parseTimeSlot(b.time);
                    return (slotA ? slotA.startTime : Infinity) - (slotB ? slotB.startTime : Infinity);
                });
                dayInfo.classes.forEach(cls => { html += `<div class="schedule-item ${cls.type === 'lab' ? 'lab' : ''} ${cls.currentClass ? 'current-class' : ''}" data-course-code="${cls.code}" data-course-title="${cls.title}"><div class="course-info"><div class="course-code"><i class="fas ${cls.type === 'lab' ? 'fa-flask' : 'fa-chalkboard-teacher'}"></i> ${cls.code} - ${cls.title}</div><div class="course-time"><i class="fas fa-clock"></i> ${cls.time}</div></div><div class="course-room"><i class="fas fa-door-open"></i> ${cls.room}</div></div>`; });
                html += `</div>`;
            }
        });
            return html || '<p class="no-results" style="text-align:center; padding:1rem;">No classes scheduled for this semester.</p>';
    }
    

    const classScheduleSemesterSelect = document.getElementById('class-schedule-semester');
    const classScheduleContentArea = document.getElementById('class-schedule-content-area');
    const classScheduleSemesterTitle = document.getElementById('class-schedule-semester-title');
    function loadClassSchedule(semesterKey) {
        const baseScheduleData = weeklySchedulesData[semesterKey]; 
        if (classScheduleContentArea) { classScheduleContentArea.innerHTML = generateScheduleHTML(baseScheduleData, semesterKey); attachModalListenersToScheduleItems(classScheduleContentArea); }
        if (classScheduleSemesterTitle && classScheduleSemesterSelect) { const selectedOptionText = classScheduleSemesterSelect.options[classScheduleSemesterSelect.selectedIndex].text; classScheduleSemesterTitle.innerHTML = `<i class="fas fa-calendar-week"></i> Weekly Schedule - ${selectedOptionText}`; }
    }
    if (classScheduleSemesterSelect) { classScheduleSemesterSelect.addEventListener('change', function() { loadClassSchedule(this.value); }); }

    const regCoursesSemesterFilter = document.getElementById('registered-courses-semester-filter');
    const regCoursesTableContainer = document.getElementById('registered-courses-table-container');
    const regCoursesCreditSummaryEl = document.getElementById('registered-courses-credit-summary');

    function renderRegisteredCoursesTable(semesterKey) {
        const coursesForSemester = studentRegisteredCourses.filter(c => c.semester === semesterKey);
        let tableHTML = '<p class="no-results" style="text-align:center; padding:1rem;">No courses registered for this semester.</p>';
        let totalCredits = 0, theoryCredits = 0, labCredits = 0;

        if (coursesForSemester.length > 0) {
            tableHTML = `<table><thead><tr><th>Course Code</th><th>Title</th><th>Credit</th><th>Section</th><th>Time</th><th>Room</th><th>Faculty</th><th>Details</th></tr></thead><tbody>`;
            coursesForSemester.forEach(course => {
                tableHTML += `<tr data-course-code="${course.courseCode}" data-course-title="${course.title}"><td>${course.courseCode}</td><td>${course.title}</td><td>${course.credit.toFixed(1)}</td><td>${course.section}</td><td>${course.time}</td><td>${course.room}</td><td>${course.faculty}</td><td><button class="btn btn-sm view-course-details-btn"><i class="fas fa-info-circle"></i> View</button></td></tr>`;
                totalCredits += course.credit;
                if (course.courseCode.toUpperCase().includes('L')) labCredits += course.credit; else theoryCredits += course.credit;
            });
            tableHTML += `</tbody></table>`;
        }
        if(regCoursesTableContainer) regCoursesTableContainer.innerHTML = tableHTML;
        if(regCoursesCreditSummaryEl) regCoursesCreditSummaryEl.innerHTML = `<div class="credit-item"><div class="credit-value">${totalCredits.toFixed(1)}</div><div class="credit-label">Total Credits</div></div><div class="credit-item"><div class="credit-value">${theoryCredits.toFixed(1)}</div><div class="credit-label">Theory Credits</div></div><div class="credit-item"><div class="credit-value">${labCredits.toFixed(1)}</div><div class="credit-label">Lab Credits</div></div><div class="credit-item"><div class="credit-value">${coursesForSemester.length}</div><div class="credit-label">Courses</div></div>`;
        
        if(regCoursesTableContainer) { 
            regCoursesTableContainer.querySelectorAll('.view-course-details-btn').forEach(btn => btn.addEventListener('click', function() { openCourseModal(this.closest('tr').dataset.courseCode); }));
        }
    }
    if(regCoursesSemesterFilter) { regCoursesSemesterFilter.addEventListener('change', function() { renderRegisteredCoursesTable(this.value); }); }

    const resultsSemesterFilter = document.getElementById('results-semester-filter');
    const academicResultsContentArea = document.getElementById('academic-results-content-area');

    function renderAcademicResults(semesterKey) {
        if (!academicResultsContentArea) return;
        academicResultsContentArea.innerHTML = ''; 

        const coursesForSemester = studentRegisteredCourses.filter(c => c.semester === semesterKey);
        if (coursesForSemester.length === 0) {
            academicResultsContentArea.innerHTML = '<p class="no-results">No results available for the selected semester.</p>';
            return;
        }

        let totalCreditsTaken = 0;
        let totalCreditsEarned = 0;
        let totalGradePointsProduct = 0;

        coursesForSemester.forEach(course => {
            totalCreditsTaken += course.credit;
            if (course.grade !== "F" && course.grade !== "IP" && course.gradePoint !== null) { 
                totalCreditsEarned += course.credit;
                totalGradePointsProduct += course.gradePoint * course.credit;
            }
        });

        const semesterGPA = totalCreditsEarned > 0 ? (totalGradePointsProduct / totalCreditsEarned).toFixed(2) : "N/A";
        
        let cumulativeGradePointsProduct = 0;
        let cumulativeCreditsEarned = 0;
        const semesterOrder = ["summer2023", "fall2023", "spring2024"]; 
        const relevantSemesters = semesterOrder.slice(0, semesterOrder.indexOf(semesterKey) + 1);

        studentRegisteredCourses.filter(c => relevantSemesters.includes(c.semester)).forEach(course => {
            if (course.grade !== "F" && course.grade !== "IP" && course.gradePoint !== null) {
                cumulativeGradePointsProduct += course.gradePoint * course.credit;
                cumulativeCreditsEarned += course.credit;
            }
        });
        const cumulativeGPA = cumulativeCreditsEarned > 0 ? (cumulativeGradePointsProduct / cumulativeCreditsEarned).toFixed(2) : "N/A";


        let resultCardHTML = `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-title">${semesterNames[semesterKey] || semesterKey}</div>
                    <div class="result-semester">Semester GPA: ${semesterGPA}</div>
                </div>
                <div class="result-details">
                    <div class="result-item"><span class="result-label">Credits Taken</span><span class="result-value">${totalCreditsTaken.toFixed(1)}</span></div>
                    <div class="result-item"><span class="result-label">Credits Earned</span><span class="result-value">${totalCreditsEarned.toFixed(1)}</span></div>
                    <div class="result-item"><span class="result-label">Semester GPA</span><span class="result-value">${semesterGPA}</span></div>
                    <div class="result-item"><span class="result-label">Cumulative GPA</span><span class="result-value">${cumulativeGPA}</span></div>
                </div>
                <div class="table-container" style="margin-top: 1.5rem;">
                    <table>
                        <thead><tr><th>Course Code</th><th>Course Title</th><th>Credit</th><th>Grade</th><th>Grade Point</th><th>Details</th></tr></thead>
                        <tbody>`;
        
        coursesForSemester.forEach(course => {
            const courseDetails = coursesData[course.courseCode];
            const hasAssessments = courseDetails && courseDetails.assessments && courseDetails.assessments.length > 0;
            resultCardHTML += `
                <tr>
                    <td>${course.courseCode}</td>
                    <td>${course.title}</td>
                    <td>${course.credit.toFixed(1)}</td>
                    <td>${course.grade || "N/A"}</td>
                    <td>${course.gradePoint !== null ? course.gradePoint.toFixed(2) : "N/A"}</td>
                    <td>${hasAssessments ? `<button class="btn btn-sm view-assessment-btn" data-course-code="${course.courseCode}" data-semester="${semesterKey}">View</button>` : 'N/A'}</td>
                </tr>`;
        });
        resultCardHTML += `</tbody></table></div></div>`;
        academicResultsContentArea.innerHTML = resultCardHTML;

        coursesForSemester.forEach(course => {
            const courseDetails = coursesData[course.courseCode];
                if (courseDetails && courseDetails.assessments && courseDetails.assessments.length > 0) {
                const assessmentDivId = `${course.courseCode}-${semesterKey}-assessment`;
                if (!document.getElementById(assessmentDivId)) {
                    const breakdownDiv = document.createElement('div');
                    breakdownDiv.className = 'assessment-breakdown';
                    breakdownDiv.id = assessmentDivId;
                    let assessmentRows = '';
                    let totalScore = 0;
                    let allScoresAreIP = true;
                    courseDetails.assessments.forEach(asm => {
                        let scoreDisplay = "N/A";
                        if (course.grade === "IP" && semesterKey === currentAcademicSemesterKey) {
                            scoreDisplay = "IP";
                        } else if (asm.score !== undefined && asm.score !== null && asm.score !== "IP") {
                            scoreDisplay = asm.score;
                            totalScore += parseFloat(asm.score) || 0;
                            allScoresAreIP = false;
                        } else if (asm.score === "IP"){
                                scoreDisplay = "IP";
                        }
                        assessmentRows += `<tr><td>${asm.type}</td><td>${asm.weight}</td><td>${scoreDisplay}</td><td>${asm.max}</td></tr>`;
                    });

                    const totalRow = (course.grade !== "IP" || semesterKey !== currentAcademicSemesterKey) && !allScoresAreIP
                        ? `<tr style="font-weight: bold;"><td>Total</td><td>100%</td><td>${totalScore.toFixed(1)}</td><td>100</td></tr>`
                        : '';


                    breakdownDiv.innerHTML = `<h4>${courseDetails.title} (${course.courseCode}) Assessment - ${semesterNames[semesterKey] || semesterKey}</h4>
                                            <div class="table-container">
                                                <table>
                                                    <thead><tr><th>Assessment Type</th><th>Weight</th><th>Score</th><th>Max Score</th></tr></thead>
                                                    <tbody>
                                                    ${assessmentRows}
                                                    ${totalRow}
                                                    </tbody>
                                                </table>
                                            </div>`;
                    academicResultsContentArea.appendChild(breakdownDiv);
                }
            }
        });
        
        academicResultsContentArea.querySelectorAll('.view-assessment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const courseCode = this.dataset.courseCode;
                const semKey = this.dataset.semester;
                const targetBreakdownId = `${courseCode}-${semKey}-assessment`;
                
                document.querySelectorAll('#academic-results-content-area .assessment-breakdown').forEach(b => b.classList.remove('active'));
                const targetBreakdown = document.getElementById(targetBreakdownId);
                if (targetBreakdown) {
                    targetBreakdown.classList.add('active');
                    targetBreakdown.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    console.warn("Assessment breakdown element not found for:", targetBreakdownId);
                    showToast("No detailed assessment breakdown available for this course/semester.", "warning");
                }
            });
        });
    }

    if(resultsSemesterFilter) { resultsSemesterFilter.addEventListener('change', function() { renderAcademicResults(this.value); }); }
    
    const financeSemesterFilter = document.getElementById('finance-semester-filter');
    const financeContentArea = document.getElementById('financial-statements-content-area');
    if(financeSemesterFilter && financeContentArea){
        financeSemesterFilter.addEventListener('change', function(){
            financeContentArea.querySelectorAll('.semester-content').forEach(sc => sc.style.display = 'none');
            const targetContent = financeContentArea.querySelector(`#${this.value}-finance`);
            if(targetContent) targetContent.style.display = 'block';
            else financeContentArea.querySelector('.no-results')?.remove() || financeContentArea.insertAdjacentHTML('beforeend', '<p class="no-results">Financial data not found for this semester.</p>');
        });
        if(financeSemesterFilter.options.length > 0) financeSemesterFilter.dispatchEvent(new Event('change'));
    }


    const requestChangeBtn = document.getElementById('request-change-btn'); 
    const cancelChangeBtn = document.getElementById('cancel-change-btn'); 
    const changeRequestForm = document.getElementById('change-request-form');
    if (requestChangeBtn && changeRequestForm && cancelChangeBtn) { 
            requestChangeBtn.addEventListener('click', () => changeRequestForm.classList.add('active'));
        cancelChangeBtn.addEventListener('click', () => changeRequestForm.classList.remove('active'));
    }

    const notificationIcon = document.querySelector('.notification-icon'); 
    const notificationDropdown = document.querySelector('.notification-dropdown');
    if (notificationIcon && notificationDropdown) { 
        notificationIcon.addEventListener('click', (event) => { event.stopPropagation(); notificationDropdown.classList.toggle('show'); });
        document.addEventListener('click', (event) => { if (notificationDropdown.classList.contains('show') && !notificationIcon.contains(event.target) && !notificationDropdown.contains(event.target)) { notificationDropdown.classList.remove('show'); } });
    }
    
    function populateModal(courseCode) { 
        const courseInfo = studentRegisteredCourses.find(c => c.courseCode === courseCode && (c.semester === currentAcademicSemesterKey || c.semester === document.getElementById('registered-courses-semester-filter')?.value )) || 
                            tempSelectedCourses.find(c => c.courseCode === courseCode) || 
                            coursesData[courseCode];

        const data = courseInfo || { title: "Details not found", credit:"", section:"", desc:"", time:"", room:"", facultyName:"", assessments:[] };
        
        courseModalTitleText.textContent = `${courseCode} - ${data.title}`;
        courseModal.querySelector('.modal-course-code').value = courseCode;
        courseModal.querySelector('.modal-course-title-input').value = data.title;
        courseModal.querySelector('.modal-course-credit').value = data.credit || 'N/A';
        courseModal.querySelector('.modal-course-section').value = data.section || 'N/A'; 
        courseModal.querySelector('.modal-course-desc').value = data.desc || 'No description available.';
        courseModal.querySelector('.modal-course-time').value = data.time || 'N/A';
        courseModal.querySelector('.modal-course-room').value = data.room || 'N/A';
        courseModal.querySelector('.modal-faculty-name').textContent = data.facultyName || data.faculty || 'TBA';

        const assessmentTableBody = courseModal.querySelector('.modal-assessment-table-body');
        assessmentTableBody.innerHTML = ''; 
        const courseMasterData = coursesData[courseCode]; 
        if(courseMasterData && courseMasterData.assessments && courseMasterData.assessments.length > 0) {
            courseMasterData.assessments.forEach(asm => { const row = assessmentTableBody.insertRow(); row.insertCell().textContent = asm.type; row.insertCell().textContent = asm.weight; row.insertCell().textContent = asm.score; row.insertCell().textContent = asm.max; });
        } else { assessmentTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No assessment details available.</td></tr>'; }
        
        modalTabs.forEach(t => t.classList.remove('active'));
        courseModal.querySelector('.modal-tab[data-tab="overview"]').classList.add('active');
        courseModal.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        courseModal.querySelector('#overview-tab').classList.add('active');
    }
    function openCourseModal(courseCode) { 
            if (!courseCode) { console.error("Course code is undefined for modal."); return; }
        populateModal(courseCode);
        courseModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    function closeCourseModal() { courseModal.style.display = 'none'; document.body.style.overflow = ''; }
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeCourseModal);
    window.addEventListener('click', (e) => { if (e.target === courseModal) closeCourseModal(); });
    modalTabs.forEach(tab => { 
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            modalTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            courseModal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            const targetTabContent = courseModal.querySelector(`#${tabId}-tab`) || courseModal.querySelector(`#${tabId}-breakdown-tab`) || courseModal.querySelector(`#results-breakdown-tab`); 
            if (targetTabContent) targetTabContent.classList.add('active');
        });
    });
    
    function attachModalListenersToScheduleItems(container) { 
            container.querySelectorAll('.schedule-item').forEach(item => {
            item.addEventListener('click', function() {
                openCourseModal(this.dataset.courseCode);
            });
        });
    }
    
    const viewPaymentHistoryBtn = document.getElementById('view-payment-history'); 
    const paymentHistorySection = document.getElementById('payment-history');
    if (viewPaymentHistoryBtn && paymentHistorySection) { 
            viewPaymentHistoryBtn.addEventListener('click', function() {
            const isHidden = paymentHistorySection.style.display === 'none' || paymentHistorySection.style.display === '';
            paymentHistorySection.style.display = isHidden ? 'block' : 'none';
            if (isHidden) paymentHistorySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    const examTabs = document.querySelectorAll('#exam-schedule .exam-tab'); 
    const examContents = document.querySelectorAll('#exam-schedule .exam-content');
    examTabs.forEach(tab => { 
            tab.addEventListener('click', function() {
            examTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const targetType = this.dataset.examType;
            examContents.forEach(content => {
                content.classList.remove('active'); 
                if (content.id === `${targetType}-exams`) content.classList.add('active');
            });
        });
    });

    function parseDayShorthand(dayStr) {
        const map = { 'S': 0, 'M': 1, 'T': 2, 'W': 3, 'Th': 4, 'F': 5, 'Sa': 6 };
        if (dayStr === "ST") return [0, 2]; 
        if (dayStr === "MW") return [1, 3]; 
        if (dayStr === "TTh") return [2, 4]; 
        let days = [];
        let currentDay = "";
        for (let char of dayStr) {
            currentDay += char;
            if (map[currentDay] !== undefined) {
                days.push(map[currentDay]);
                currentDay = "";
            } else if (currentDay.length > 2) { 
                console.warn("Could not parse day shorthand:", dayStr);
                return null; 
            }
        }
        return days.length > 0 ? days : null;
    }

    function parseTime(timeStr) { 
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes; 
    }

    function parseTimeSlot(timeString) { 
        if (!timeString || typeof timeString !== 'string') return null;
        const parts = timeString.split(' ');
        if (parts.length < 2) return null;

        const dayStr = parts[0];
        const timeRange = parts.slice(1).join(' '); 

        const days = parseDayShorthand(dayStr);
        if (!days) return null;

        const timeParts = timeRange.split('-');
        if (timeParts.length !== 2) return null;

        const startTime = parseTime(timeParts[0].trim());
        const endTime = parseTime(timeParts[1].trim());

        if (isNaN(startTime) || isNaN(endTime)) return null;

        return { days, startTime, endTime };
    }

    function checkTimeOverlap(slot1, slot2) {
        if (!slot1 || !slot2) return false;
        const daysOverlap = slot1.days.some(day1 => slot2.days.includes(day1));
        if (!daysOverlap) return false;
        const timesOverlap = slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime;
        return timesOverlap;
    }

    const registrationMainView = document.getElementById('registration-main-view');
    const offeredSectionsView = document.getElementById('offered-sections-view');
    const programCoursesListContainer = document.getElementById('program-courses-list');
    const offeredSectionsListContainer = document.getElementById('registration-course-list-container');
    const offeredSectionsTitle = document.getElementById('offered-sections-title');
    const backToAllCoursesBtn = document.getElementById('back-to-all-courses-btn');
    const programCourseSearchInput = document.getElementById('program-course-search-input');
    const sectionSearchInput = document.getElementById('section-search-input');
    
    const selectedCoursesListEl = document.getElementById('selected-courses-list');
    const finalConfirmButtonContainerEl = document.getElementById('final-confirm-button-container');


    function updateApplicationStatusCard() { 
        const statusCardContainer = document.getElementById('application-status-card-content'); 
        if (!statusCardContainer) return;
        
        statusCardContainer.querySelectorAll('.dynamic-status:not(.no-results)').forEach(el => el.remove());
        const noResultsEl = statusCardContainer.querySelector('.no-results.dynamic-status');

        let hasDynamicContent = false;

        const currentSemesterRegCourses = studentRegisteredCourses.filter(c => c.semester === currentAcademicSemesterKey);
        if (currentSemesterRegCourses.length > 0) { 
            const regItem = document.createElement('div');
            regItem.className = 'status-badge status-item dynamic-status'; 
            regItem.innerHTML = `<span>${semesterNames[currentAcademicSemesterKey]} Registration</span> <span class="status-badge status-approved">Approved</span>`;
            statusCardContainer.insertBefore(regItem, noResultsEl); 
            hasDynamicContent = true;
        }

        courseDropRequests.filter(req => req.status === "Pending").forEach(req => {
            const item = document.createElement('div');
            item.className = 'status-badge status-item dynamic-status';
            item.innerHTML = `<span>Drop Request: ${req.courseCode} (${req.section}) - ${semesterNames[req.semester] || req.semester}</span> <span class="status-badge status-pending">Pending</span>`;
            statusCardContainer.appendChild(item);
            hasDynamicContent = true;
        });
        
        if(noResultsEl) noResultsEl.style.display = hasDynamicContent ? 'none' : 'block';
    }


    function displayProgramCourses(filterTerm = "") { 
        if (!programCoursesListContainer) return;
        programCoursesListContainer.innerHTML = '';
        const filteredProgramCourses = programCoursesData.filter(course => 
            course.code.toLowerCase().includes(filterTerm) ||
            course.title.toLowerCase().includes(filterTerm)
        );
        if (filteredProgramCourses.length === 0) { programCoursesListContainer.innerHTML = '<p class="no-results">No program courses found.</p>'; return; }
        filteredProgramCourses.forEach(course => {
            const availableSectionsCount = allOfferedSectionsData.filter(s => s.courseCode === course.code).length;
            const item = document.createElement('div');
            item.className = 'program-course-item';
            item.dataset.courseCode = course.code;
            item.innerHTML = `<h5><i class="fas fa-book-medical"></i> ${course.code} - ${course.title}</h5><p>${course.credits} Credits <span style="margin-left:10px; color:var(--accent); font-weight:500;">(${availableSectionsCount} Section${availableSectionsCount !== 1 ? 's' : ''} Available)</span></p>`;
            item.addEventListener('click', function() { showOfferedSectionsForCourse(this.dataset.courseCode); });
            programCoursesListContainer.appendChild(item);
        });
    }
    if (programCourseSearchInput) { programCourseSearchInput.addEventListener('input', function() { displayProgramCourses(this.value.toLowerCase().trim()); }); }


    function displayOfferedSections(sectionsToDisplay, forCourseCode) { 
        if (!offeredSectionsListContainer) return;
        const noResultsMsgEl = offeredSectionsListContainer.querySelector('.no-results');
        // Clear only course cards, not the no-results message itself
        Array.from(offeredSectionsListContainer.querySelectorAll('.registration-course-card')).forEach(card => card.remove());


        if (sectionsToDisplay.length === 0) { 
            if(noResultsMsgEl) noResultsMsgEl.style.display = 'block'; 
            return; 
        }
        if(noResultsMsgEl) noResultsMsgEl.style.display = 'none';

        sectionsToDisplay.forEach(sectionData => {
            const card = document.createElement('div'); card.className = 'registration-course-card';
            const isFull = sectionData.enrolled >= sectionData.capacity;
            
            // Check if already in tempSelectedCourses OR studentRegisteredCourses for this semester
            const isSelectedInTemp = tempSelectedCourses.some(tc => tc.courseCode === sectionData.courseCode && tc.section === sectionData.section);
            const isRegisteredThisSemester = studentRegisteredCourses.some(rc => rc.semester === currentAcademicSemesterKey && rc.courseCode === sectionData.courseCode && rc.section === sectionData.section);
            const isRegisteredAnySectionThisCourse = studentRegisteredCourses.some(rc => rc.semester === currentAcademicSemesterKey && rc.courseCode === sectionData.courseCode);
            const isSelectedAnySectionThisCourseInTemp = tempSelectedCourses.some(tc => tc.courseCode === sectionData.courseCode);


            const newSlot = parseTimeSlot(sectionData.time); let hasConflict = false;
            if (newSlot && !isSelectedInTemp && !isRegisteredThisSemester) { 
                // Check conflict with already registered courses
                for (const regCourse of studentRegisteredCourses.filter(rc => rc.semester === currentAcademicSemesterKey)) { 
                    const existingSlot = parseTimeSlot(regCourse.time); 
                    if (checkTimeOverlap(newSlot, existingSlot)) { hasConflict = true; card.classList.add('conflict'); break; } 
                }
                // Check conflict with temp selected courses (if no conflict with registered ones yet)
                if(!hasConflict) {
                    for (const tempCourse of tempSelectedCourses) {
                        const tempSlot = parseTimeSlot(tempCourse.time);
                        if (checkTimeOverlap(newSlot, tempSlot)) { hasConflict = true; card.classList.add('conflict'); break; }
                    }
                }
            }

            let buttonHTML;
            if (isSelectedInTemp) {
                    buttonHTML = `<button class="btn btn-sm btn-warning remove-temp-course-btn" data-course-code="${sectionData.courseCode}" data-section="${sectionData.section}"><i class="fas fa-minus-circle"></i> Selected (Click to Unselect)</button>`;
            } else if (isRegisteredThisSemester) { // If already officially registered
                buttonHTML = `<button class="btn btn-sm btn-outline-success disabled" disabled><i class="fas fa-check-circle"></i> Already Registered</button>`;
            } else if (isRegisteredAnySectionThisCourse || isSelectedAnySectionThisCourseInTemp) {
                    buttonHTML = `<button class="btn btn-sm btn-secondary disabled" disabled title="Already selected/registered for ${sectionData.courseCode} in another section."><i class="fas fa-ban"></i> Course Added (Other Section)</button>`;
            } else if (isFull) {
                buttonHTML = `<button class="btn btn-sm btn-danger disabled" disabled><i class="fas fa-times-circle"></i> Full</button>`;
            } else if (hasConflict) {
                buttonHTML = `<button class="btn btn-sm btn-danger disabled" disabled title="Time conflict with another selected/registered course."><i class="fas fa-exclamation-triangle"></i> Time Conflict</button>`;
            } else {
                buttonHTML = `<button class="btn btn-sm btn-success add-course-btn" data-course-code="${sectionData.courseCode}" data-section="${sectionData.section}"><i class="fas fa-plus-circle"></i> Add to Selection</button>`;
            }
            card.innerHTML = `<h4>${sectionData.courseCode} - Section ${sectionData.section}</h4> <p><i class="fas fa-clock"></i> ${sectionData.time}</p> <p><i class="fas fa-map-marker-alt"></i> Room: ${sectionData.room}</p> <p><i class="fas fa-chalkboard-teacher"></i> Faculty: ${sectionData.faculty}</p> <p><i class="fas fa-users"></i> Enrollment: <span class="enrollment-status">${sectionData.enrolled}/${sectionData.capacity}</span></p> ${buttonHTML}`;
            offeredSectionsListContainer.appendChild(card);
        });
        offeredSectionsListContainer.querySelectorAll('.add-course-btn').forEach(button => button.addEventListener('click', handleAddToTempSelectionClick));
        offeredSectionsListContainer.querySelectorAll('.remove-temp-course-btn').forEach(button => button.addEventListener('click', function() {
                handleRemoveFromTempSelection(this.dataset.courseCode, this.dataset.section, true); // true to re-render offered sections
        }));
    }
    
    function handleAddToTempSelectionClick(event) { 
        const button = event.target.closest('.add-course-btn');
        const courseCode = button.dataset.courseCode;
        const section = button.dataset.section;

        // Check if already selected in temp or registered in studentRegisteredCourses for THIS course
        if (tempSelectedCourses.some(tc => tc.courseCode === courseCode) || studentRegisteredCourses.some(rc => rc.semester === currentAcademicSemesterKey && rc.courseCode === courseCode)) {
            showToast(`You have already selected or registered for ${courseCode}. You cannot add multiple sections of the same course.`, 'error');
            return;
        }

        const sectionData = allOfferedSectionsData.find(s => s.courseCode === courseCode && s.section === section);
        const courseMasterData = coursesData[courseCode] || programCoursesData.find(pc => pc.code === courseCode);
        
        const newSlot = parseTimeSlot(sectionData.time);
        if (newSlot) { 
                for (const regCourse of studentRegisteredCourses.filter(rc => rc.semester === currentAcademicSemesterKey)) { 
                const existingSlot = parseTimeSlot(regCourse.time); 
                if (checkTimeOverlap(newSlot, existingSlot)) { 
                    showToast(`Time conflict with your registered course ${regCourse.courseCode} (${regCourse.time}). Cannot select.`, 'error'); 
                    return; 
                } 
            }
            for (const tempCourse of tempSelectedCourses) {
                const tempSlot = parseTimeSlot(tempCourse.time);
                if (checkTimeOverlap(newSlot, tempSlot)) {
                    showToast(`Time conflict with your selected course ${tempCourse.courseCode} (${tempCourse.time}). Cannot select.`, 'error');
                    return;
                }
            }
        }

        if (sectionData && courseMasterData) { 
            tempSelectedCourses.push({ 
                semester: currentAcademicSemesterKey, // Will be finalized on confirm
                courseCode: sectionData.courseCode, 
                title: courseMasterData.title, 
                credit: courseMasterData.credits || courseMasterData.credit, 
                section: sectionData.section, 
                time: sectionData.time, 
                room: sectionData.room, 
                faculty: sectionData.faculty,
                grade: "IP", 
                gradePoint: null
            }); 
            sectionData.enrolled++; 
            
            renderSelectedCoursesForRegistration();
            // Re-render offered sections for THIS course to update button states
            const currentCourseCodeForSectionsViewMatch = offeredSectionsTitle.textContent.match(/for (\w+)\s*-/);
            const currentCourseCodeForSectionsView = currentCourseCodeForSectionsViewMatch ? currentCourseCodeForSectionsViewMatch[1] : null;
            if (currentCourseCodeForSectionsView && currentCourseCodeForSectionsView === courseCode) {
                showOfferedSectionsForCourse(courseCode); 
            }
            showToast(`${courseCode} - Section ${section} added to your selection.`, 'info'); 
        } else { showToast(`Error selecting course. Data not found.`, 'error'); }
    }

    function handleRemoveFromTempSelection(courseCode, section, rerenderOffered = false) {
        const courseIndex = tempSelectedCourses.findIndex(tc => 
            tc.courseCode === courseCode && tc.section === section
        );

        if (courseIndex > -1) {
            tempSelectedCourses.splice(courseIndex, 1);
            const sectionData = allOfferedSectionsData.find(s => s.courseCode === courseCode && s.section === section);
            if (sectionData) {
                sectionData.enrolled = Math.max(0, sectionData.enrolled - 1);
            }
            
            renderSelectedCoursesForRegistration();
            if (rerenderOffered) {
                const currentCourseCodeForSectionsViewMatch = offeredSectionsTitle.textContent.match(/for (\w+)\s*-/);
                const currentCourseCodeForSectionsView = currentCourseCodeForSectionsViewMatch ? currentCourseCodeForSectionsViewMatch[1] : null;
                    if (offeredSectionsView.style.display === 'block' && currentCourseCodeForSectionsView && currentCourseCodeForSectionsView === courseCode) {
                    showOfferedSectionsForCourse(courseCode);
                }
            }
            showToast(`${courseCode} - Section ${section} removed from your selection.`, 'info');
        }
    }


    function showOfferedSectionsForCourse(courseCode) { 
        const course = programCoursesData.find(c => c.code === courseCode) || coursesData[courseCode];
        if (offeredSectionsTitle && course) offeredSectionsTitle.textContent = `Offered Sections for ${courseCode} - ${course.title}`;
        const filteredSections = allOfferedSectionsData.filter(s => s.courseCode === courseCode);
        displayOfferedSections(filteredSections, courseCode); 
        if (registrationMainView) registrationMainView.style.display = 'none';
        if (offeredSectionsView) offeredSectionsView.style.display = 'block';
        if (sectionSearchInput) sectionSearchInput.value = ''; 
    }

        if (sectionSearchInput) { 
        sectionSearchInput.addEventListener('input', function() {
            const filterTerm = this.value.toLowerCase().trim();
            const currentCourseCodeMatch = offeredSectionsTitle.textContent.match(/for (\w+)\s*-/); 
            const currentCourseCode = currentCourseCodeMatch ? currentCourseCodeMatch[1] : null;
            
            let sectionsToFilter = allOfferedSectionsData;
            if(currentCourseCode && offeredSectionsView.style.display === 'block') { 
                sectionsToFilter = allOfferedSectionsData.filter(s => s.courseCode === currentCourseCode);
            }

            const filteredSections = sectionsToFilter.filter(s =>
                s.faculty.toLowerCase().includes(filterTerm) ||
                s.time.toLowerCase().includes(filterTerm) ||
                s.room.toLowerCase().includes(filterTerm)
            );
            displayOfferedSections(filteredSections, currentCourseCode);
        });
        }
    

    if (backToAllCoursesBtn) { 
            backToAllCoursesBtn.addEventListener('click', function() {
            if (registrationMainView) registrationMainView.style.display = 'block';
            if (offeredSectionsView) offeredSectionsView.style.display = 'none';
            if (programCourseSearchInput) programCourseSearchInput.value = ''; 
            displayProgramCourses(); 
        });
    }
    
    function renderSelectedCoursesForRegistration() {
        if (!selectedCoursesListEl || !finalConfirmButtonContainerEl) return;
        selectedCoursesListEl.innerHTML = ''; // Clear previous
        finalConfirmButtonContainerEl.innerHTML = ''; // Clear button

        if (tempSelectedCourses.length === 0) {
            selectedCoursesListEl.innerHTML = '<p class="no-results">No courses selected yet. Add courses from the list below.</p>';
            return;
        }

        tempSelectedCourses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'registration-course-card'; // Can add a modifier class if needed
            card.innerHTML = `
                <h4>${course.courseCode} - ${course.title} (Section ${course.section})</h4>
                <p><i class="fas fa-clock"></i> ${course.time}</p>
                <p><i class="fas fa-map-marker-alt"></i> Room: ${course.room}</p>
                <p><i class="fas fa-chalkboard-teacher"></i> Faculty: ${course.faculty}</p>
                <p><i class="fas fa-coins"></i> Credits: ${course.credit.toFixed(1)}</p>
                <button class="btn btn-sm btn-danger remove-temp-course-btn" data-course-code="${course.courseCode}" data-section="${course.section}" style="align-self: flex-end;"><i class="fas fa-times-circle"></i> Remove from Selection</button>
            `;
            selectedCoursesListEl.appendChild(card);
        });

        selectedCoursesListEl.querySelectorAll('.remove-temp-course-btn').forEach(button => {
            button.addEventListener('click', function() {
                handleRemoveFromTempSelection(this.dataset.courseCode, this.dataset.section, true); // true to rerender offered section if visible
            });
        });

        // Add the confirm button
            const confirmBtn = document.createElement('button');
            confirmBtn.id = 'final-confirm-registration-btn';
            confirmBtn.className = 'btn btn-success';
            confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Registration & Update Portal';
            confirmBtn.addEventListener('click', finalizeRegistration);
            finalConfirmButtonContainerEl.appendChild(confirmBtn);
    }

    function finalizeRegistration() {
        if (tempSelectedCourses.length === 0) {
            showToast("No courses selected to confirm.", "warning");
            return;
        }
        if (confirm(`Are you sure you want to confirm these ${tempSelectedCourses.length} selected course(s)? This will update your official registration.`)) {
            // Merge tempSelectedCourses into studentRegisteredCourses
            // Ensure no duplicates by courseCode (assuming one section per course rule)
            tempSelectedCourses.forEach(tempCourse => {
                if (!studentRegisteredCourses.some(rc => rc.semester === currentAcademicSemesterKey && rc.courseCode === tempCourse.courseCode)) {
                    studentRegisteredCourses.push({...tempCourse}); // Add a copy
                }
            });
            
            tempSelectedCourses = []; // Clear temp selections
            renderSelectedCoursesForRegistration(); // Update the selected courses display (will show empty)
            
            // Refresh all relevant portal sections
            updateApplicationStatusCard();
            if (document.getElementById('registered-courses').style.display === 'block' || document.querySelector('.sidebar-menu a[href="#registered-courses"].active')) {
                renderRegisteredCoursesTable(currentAcademicSemesterKey);
            }
            if (document.getElementById('class-schedule-page').style.display === 'block' || document.querySelector('.sidebar-menu a[href="#class-schedule-page"].active')) {
                loadClassSchedule(currentAcademicSemesterKey);
            }
            if (document.getElementById('academic-results').style.display === 'block' || document.querySelector('.sidebar-menu a[href="#academic-results"].active')) {
                renderAcademicResults(currentAcademicSemesterKey);
            }
            loadDashboardData(); // Always update dashboard
            
            showToast("Registration Finalized and Portal Updated!", 'success');
            // Optionally, navigate away or reset offered sections view
            if (offeredSectionsView.style.display === 'block') {
                    showOfferedSectionsForCourse(offeredSectionsTitle.textContent.match(/for (\w+)\s*-/)?.[1]); // Re-render offered sections
            }
        }
    }


    const dropCourseListEl = document.getElementById('drop-course-list');
    const dropHistoryTableContainerEl = document.getElementById('drop-history-table-container');
    const dropAppCurrentSemesterNameEl = document.getElementById('drop-app-current-semester-name');

    function renderDropApplicationPage() { 
        if(dropAppCurrentSemesterNameEl) dropAppCurrentSemesterNameEl.textContent = semesterNames[currentAcademicSemesterKey] || currentAcademicSemesterKey;
        if (dropCourseListEl) {
            const coursesToDrop = studentRegisteredCourses.filter(c => c.semester === currentAcademicSemesterKey);
            if (coursesToDrop.length === 0) { dropCourseListEl.innerHTML = '<p class="no-results">No courses registered in the current semester to drop.</p>'; } else {
                let listHTML = '<table><thead><tr><th>Course Code</th><th>Title</th><th>Section</th><th>Action</th></tr></thead><tbody>';
                coursesToDrop.forEach(course => { const isPending = courseDropRequests.some(req => req.courseCode === course.courseCode && req.section === course.section && req.status === "Pending" && req.semester === currentAcademicSemesterKey); listHTML += `<tr><td>${course.courseCode}</td><td>${course.title}</td><td>${course.section}</td><td>${isPending ? '<span class="status-badge status-pending">Drop Requested</span>' : `<button class="btn btn-sm btn-danger request-drop-btn" data-course-code="${course.courseCode}" data-course-title="${course.title}" data-section="${course.section}">Request Drop</button>`}</td></tr>`; });
                listHTML += '</tbody></table>'; dropCourseListEl.innerHTML = listHTML;
                dropCourseListEl.querySelectorAll('.request-drop-btn').forEach(button => button.addEventListener('click', function() { if (confirm(`Are you sure you want to request dropping ${this.dataset.courseCode} - ${this.dataset.courseTitle} (Section ${this.dataset.section})?`)) handleCourseDropRequest(this.dataset.courseCode, this.dataset.courseTitle, this.dataset.section); }));
            }
        }
        renderDropHistoryTable();
    }

    function handleCourseDropRequest(courseCode, courseTitle, section) { 
        const existingPendingRequest = courseDropRequests.some(req => 
            req.courseCode === courseCode && req.section === section && req.status === "Pending" && req.semester === currentAcademicSemesterKey
        );
        if (existingPendingRequest) { showToast(`A drop request for ${courseCode} - Section ${section} is already pending.`, 'warning'); return; }

        courseDropRequests.push({ semester: currentAcademicSemesterKey, courseCode, courseTitle, section, requestDate: new Date().toISOString().slice(0,10), status: "Pending" });
        showToast(`Drop request for ${courseCode} - Section ${section} submitted.`, 'info');
        renderDropApplicationPage(); 
        updateApplicationStatusCard(); 
    }

        function renderDropHistoryTable() {
        if (!dropHistoryTableContainerEl) return;
        if (courseDropRequests.length === 0) {
            dropHistoryTableContainerEl.innerHTML = '<p class="no-results">No drop request history found.</p>';
            return;
        }
        let historyHTML = '<table><thead><tr><th>Request Date</th><th>Semester</th><th>Course Code</th><th>Title</th><th>Section</th><th>Status</th></tr></thead><tbody>';
        courseDropRequests.forEach(req => {
            let statusClass = '';
            if (req.status === "Pending") statusClass = 'status-pending';
            else if (req.status === "Approved") statusClass = 'status-approved';
            else if (req.status === "Rejected") statusClass = 'status-rejected';
            historyHTML += `<tr>
                                <td>${req.requestDate}</td>
                                <td>${semesterNames[req.semester] || req.semester}</td>
                                <td>${req.courseCode}</td>
                                <td>${req.courseTitle}</td>
                                <td>${req.section}</td>
                                <td><span class="status-badge ${statusClass}">${req.status}</span></td>
                            </tr>`;
        });
        historyHTML += '</tbody></table>';
        dropHistoryTableContainerEl.innerHTML = historyHTML;
    }


    const monthYearDisplay = document.getElementById('month-year-display');
    const calendarGrid = document.querySelector('#academic-calendar-page .calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const eventPopup = document.getElementById('calendar-event-details-popup');
    const eventPopupTitle = document.getElementById('calendar-event-popup-title');
    const eventPopupBody = document.getElementById('calendar-event-popup-body');
    const closeEventPopupBtn = document.getElementById('close-calendar-event-popup');
    let currentCalendarDate = new Date(); 
    
        const academicCalendarEventsData = {
        "2024-01-01": [{ title: "New Year's Day", type: "holiday", icon: "fas fa-calendar-day", description: "University Holiday." }],
        "2024-01-15": [{ title: "Spring Semester Classes Start", type: "registration", icon: "fas fa-play-circle", description: "First day of classes for Spring 2024." }],
        "2024-01-22": [{ title: "Last Day to Add/Drop Courses (Spring)", type: "deadline", icon: "fas fa-calendar-times", description: "Final day for course registration changes without penalty." }],
        "2024-02-14": [{ title: "Falgun & Valentine's Day", type: "other", icon: "fas fa-heart", description: "Campus cultural events (regular classes)." }],
        "2024-02-21": [{ title: "International Mother Language Day", type: "holiday", icon: "fas fa-monument", description: "University closed." }],
        "2024-03-08": [{ title: "Quiz 1 Period Starts", type: "exam", icon: "fas fa-file-alt", description: "First quiz period for Spring 2024 courses." }],
        "2024-03-17": [{ title: "Birthday of Bangabandhu Sheikh Mujibur Rahman", type: "holiday", icon: "fas fa-flag", description: "National Holiday." }],
        "2024-03-25": [{ title: "Midterm Exams Start", type: "exam", icon: "fas fa-file-signature", description: "Midterm examinations for Spring 2024 begin today." }],
        "2024-03-26": [{ title: "Independence Day", type: "holiday", icon: "fas fa-flag-checkered", description: "National Holiday." }],
        "2024-04-01": [{ title: "Quiz 2 Period Starts", type: "exam", icon: "fas fa-file-alt", description: "Second quiz period for Spring 2024 courses." }],
        "2024-04-05": [{ title: "Midterm Exams End", type: "exam", icon: "fas fa-file-signature", description: "Midterm examinations for Spring 2024 conclude." }],
        "2024-04-10": [{ title: "Project Submission (CSE3205)", type: "deadline", icon: "fas fa-clipboard-check", description: "Deadline for CSE3205 project." }, { title: "Eid-ul-Fitr Holiday Starts (Tentative)", type: "holiday", icon: "fas fa-moon", description: "University closed for Eid celebrations." }],
        "2024-04-14": [{ title: "Pohela Boishakh", type: "holiday", icon: "fas fa-glass-cheers", description: "University closed for Pohela Boishakh." }],
        "2024-04-20": [{ title: "Classes Resume after Eid", type: "other", icon: "fas fa-undo", description: "Classes resume after Eid & Pohela Boishakh holidays." }],
        "2024-05-01": [{ title: "May Day", type: "holiday", icon: "fas fa-hard-hat", description: "University closed for May Day." }],
        "2024-05-10": [{ title: "Last Day of Classes (Spring)", type: "other", icon: "fas fa-stop-circle", description: "Final day of lectures for Spring 2024." }],
        "2024-05-12": [{ title: "Study Break Starts", type: "other", icon: "fas fa-book-reader", description: "Study break before final exams." }],
        "2024-05-15": [{ title: "Final Exam Schedule Publish", type: "other", icon: "fas fa-calendar-alt", description: "Tentative date for final exam schedule publication."}],
        "2024-05-20": [{ title: "Final Exams Start (Spring)", type: "exam", icon: "fas fa-graduation-cap", description: "Final examinations for Spring 2024 begin." }],
        "2024-06-02": [{ title: "Final Exams End (Spring)", type: "exam", icon: "fas fa-graduation-cap", description: "Final examinations for Spring 2024 conclude." }],
        "2024-06-10": [{ title: "Grade Submission Deadline (Faculty)", type: "deadline", icon: "fas fa-user-check", description: "Faculty deadline to submit final grades." }],
        "2024-06-15": [{ title: "Results Publication (Spring)", type: "other", icon: "fas fa-chart-bar", description: "Tentative date for Spring 2024 results." }],
        "2024-06-17": [{ title: "Eid-ul-Adha Holiday (Tentative)", type: "holiday", icon: "fas fa-mosque", description: "University closed for Eid-ul-Adha." }],
        "2024-06-20": [{ title: "Summer Semester Registration Starts", type: "registration", icon: "fas fa-edit", description: "Registration period for Summer 2024 opens." }],
        "2024-07-01": [{ title: "Summer Semester Classes Start", type: "registration", icon: "fas fa-play-circle", description: "First day of classes for Summer 2024." }],
        "2024-07-10": [{ title: "Last Day to Add/Drop Courses (Summer)", type: "deadline", icon: "fas fa-calendar-times", description: "Final day for Summer 2024 course changes." }],
        "2024-08-15": [{ title: "National Mourning Day", type: "holiday", icon: "fas fa-flag", description: "University closed." }],
        "2024-08-20": [{ title: "Summer Midterm Exams Start", type: "exam", icon: "fas fa-file-signature", description: "Midterm exams for Summer 2024." }],
        "2024-09-05": [{ title: "Summer Midterm Exams End", type: "exam", icon: "fas fa-file-signature", description: "Summer midterm exams conclude." }],
        "2024-09-16": [{ title: "Eid-e-Miladunnabi (Tentative)", type: "holiday", icon: "fas fa-moon", description: "University holiday." }],
        "2024-09-25": [{ title: "Last Day of Classes (Summer)", type: "other", icon: "fas fa-stop-circle", description: "Final day of lectures for Summer 2024." }],
        "2024-10-01": [{ title: "Summer Final Exams Start", type: "exam", icon: "fas fa-graduation-cap", description: "Final exams for Summer 2024 begin." }],
        "2024-10-13": [{ title: "Durga Puja (Bijoya Dashami)", type: "holiday", icon: "fas fa-om", description: "University closed for Durga Puja." }],
        "2024-10-15": [{ title: "Summer Final Exams End", type: "exam", icon: "fas fa-graduation-cap", description: "Summer final exams conclude." }],
        "2024-10-25": [{ title: "Results Publication (Summer)", type: "other", icon: "fas fa-chart-bar", description: "Tentative date for Summer 2024 results." }],
        "2024-10-28": [{ title: "Fall Semester Registration Starts", type: "registration", icon: "fas fa-edit", description: "Registration for Fall 2024 opens." }],
        "2024-11-10": [{ title: "Fall Semester Classes Start", type: "registration", icon: "fas fa-play-circle", description: "First day of classes for Fall 2024." }],
        "2024-12-16": [{ title: "Victory Day", type: "holiday", icon: "fas fa-flag-checkered", description: "National Holiday." }],
        "2024-12-25": [{ title: "Christmas Day", type: "holiday", icon: "fas fa-church", description: "University Holiday." }]
    };


    function generateCalendar(year, month) {
        if (!calendarGrid) return;
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if(monthYearDisplay) monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
        
        const dayCells = calendarGrid.querySelectorAll('.calendar-day-cell, .empty-day');
        dayCells.forEach(cell => cell.remove());

        const firstDayOfMonth = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.insertAdjacentHTML('beforeend', '<div class="calendar-day-cell empty-day"></div>');
        }

        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            
            let dayCellHTML = `<div class="calendar-day-cell ${isToday ? 'today' : ''}">
                                <div class="day-number">${day}</div>`;
            
            if (academicCalendarEventsData[dateStr]) {
                academicCalendarEventsData[dateStr].forEach(event => {
                    dayCellHTML += `<div class="calendar-event ${event.type}" data-event-title="${event.title}" data-event-desc="${event.description || ''}" data-event-date="${dateStr}">
                                        ${event.icon ? `<i class="${event.icon}"></i>` : ''}
                                        ${event.title}
                                        <span class="event-tooltip">${event.title} - ${event.description || 'No further details.'}</span>
                                    </div>`;
                });
            }
            dayCellHTML += `</div>`;
            calendarGrid.insertAdjacentHTML('beforeend', dayCellHTML);
        }
        
        calendarGrid.querySelectorAll('.calendar-event').forEach(eventEl => {
            eventEl.addEventListener('click', function() {
                if(eventPopupTitle) eventPopupTitle.textContent = this.dataset.eventTitle;
                if(eventPopupBody) eventPopupBody.innerHTML = `<p><strong>Date:</strong> ${new Date(this.dataset.eventDate + "T00:00:00").toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                            <p>${this.dataset.eventDesc || 'No further details.'}</p>`;
                if(eventPopup) eventPopup.style.display = 'block';
            });
        });
    }

    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); generateCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth()); });
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); generateCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth()); });
    if(closeEventPopupBtn && eventPopup) { closeEventPopupBtn.addEventListener('click', () => eventPopup.style.display = 'none'); window.addEventListener('click', (e) => { if(e.target === eventPopup) eventPopup.style.display = 'none'; }); }
    


    const pageNavButton = document.querySelector('.page-navigation');
    const sidebar = document.querySelector('.sidebar');
    if (pageNavButton && sidebar) {
        pageNavButton.addEventListener('click', function() {
            if (window.innerWidth <= 992) { 
                const isSidebarHidden = sidebar.style.display === 'none' || sidebar.style.display === '';
                sidebar.style.display = isSidebarHidden ? 'block' : 'none';
                this.querySelector('i').classList.toggle('fa-bars', !isSidebarHidden);
                this.querySelector('i').classList.toggle('fa-times', isSidebarHidden);
            }
        });
        function handleResizeForFAB() {
            if (window.innerWidth > 992) {
                pageNavButton.style.display = 'none';
                sidebar.style.display = 'block'; 
            } else {
                pageNavButton.style.display = 'flex';
                    if (!sidebar.classList.contains('keep-open-mobile')) { 
                    sidebar.style.display = 'none'; 
                }
                    pageNavButton.querySelector('i').classList.add('fa-bars');
                    pageNavButton.querySelector('i').classList.remove('fa-times');
            }
        }
        window.addEventListener('resize', handleResizeForFAB);
        handleResizeForFAB(); 
    }

    // --- Initial Load for Portal (after login, if applicable) ---
    // The actual page display logic (showPage, setActiveLink) will be called
    // explicitly after successful login for the dashboard or based on hash.
    
    // For existing portal elements that need immediate setup if they become visible:
    if (document.getElementById('registration-schedule')) { 
        renderSelectedCoursesForRegistration(); // Ensure this is called
        displayProgramCourses(); 
    }
    updateApplicationStatusCard(); // Call this in case there's state to show immediately

    // Check if already "logged in" (e.g., from session storage for a refresh scenario)
    // For this demo, we always start with login.
    // If you implement "Remember Me", you'd check that flag here.
    
});
