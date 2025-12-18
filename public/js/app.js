const API_URL = '/api';

// --- AUTH LOGIC ---

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Login Success!', true);
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            showToast(data.message || 'Login failed');
        }
    } catch (err) {
        showToast('Server connection error');
    }
}

function handleRegister() {
    showToast('Registration is disabled in demo mode.');
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
    } else {
        const u = JSON.parse(user);
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = u.name;
    }
}


// --- DASHBOARD LOGIC ---

async function loadDashboardData() {
    try {
        // Fetch Stats
        const statsRes = await fetch(`${API_URL}/stats?t=${Date.now()}`);
        const stats = await statsRes.json();

        updateStat('stat-events', stats.totalEvents);
        updateStat('stat-attendees', stats.totalAttendees);
        updateStat('stat-revenue', `${stats.totalRevenue.toLocaleString()} CFA`);
        updateStat('stat-vendors', stats.activeVendors);

        // Fetch Events for Table
        const eventsRes = await fetch(`${API_URL}/events?t=${Date.now()}`);
        const events = await eventsRes.json();
        currentEvents = events; // Store for edit modal
        renderEventsTable(events);

        // Fetch Vendors for Table
        const vendorsRes = await fetch(`${API_URL}/vendors?t=${Date.now()}`);
        const vendors = await vendorsRes.json();
        renderVendorsTable(vendors);

        // Fetch Tasks (Added support)
        const tasksRes = await fetch(`${API_URL}/tasks?t=${Date.now()}`);
        const tasks = await tasksRes.json();
        renderTasksTable(tasks);

        // Init Charts
        initCharts(stats, events);

    } catch (err) {
        console.error("Error loading dashboard data:", err);
    }
}

// --- ADD FORM HANDLERS ---
async function handleAddEvent() {
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const budget = document.getElementById('eventBudget').value;

    if (!name || !date || !location) return showToast('All fields required');

    try {
        const res = await fetch(`${API_URL}/events?t=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, date, location, budget: Number(budget) })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Event Added Successfully!', true);
            closeModal('eventModal');
            await loadDashboardData();
        } else {
            showToast('Failed: ' + (data.message || 'Server error'));
        }
    } catch (e) {
        showToast('Error connecting to server');
    }
}

async function handleAddVendor() {
    const name = document.getElementById('vendorName').value;
    const category = document.getElementById('vendorCategory').value;
    const contact = document.getElementById('vendorContact').value;

    if (!name) return showToast('Name required');

    try {
        const res = await fetch(`${API_URL}/vendors?t=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, contact })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Vendor Added Successfully!', true);
            closeModal('vendorModal');
            await loadDashboardData();
        } else {
            showToast('Failed: ' + (data.message || 'Server error'));
        }
    } catch (e) { showToast('Error adding vendor'); }
}

let currentEvents = []; // Store events locally to populate edit modal

async function handleAddTask() {
    const description = document.getElementById('taskDesc').value;
    const assignedTo = document.getElementById('taskAssign').value;
    const deadline = document.getElementById('taskDeadline').value;

    if (!description) return showToast('Description required');

    try {
        const res = await fetch(`${API_URL}/tasks?t=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, assignedTo, deadline })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Task Added Successfully!', true);
            closeModal('taskModal');
            await loadDashboardData();
        } else {
            showToast('Failed: ' + (data.message || 'Server error'));
        }
    } catch (e) { showToast('Error adding task'); }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        const res = await fetch(`${API_URL}/events/${id}?t=${Date.now()}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            showToast('Event Deleted Successfully!', true);
            await loadDashboardData();
        } else {
            showToast('Delete Failed: ' + (data.message || 'Error'));
        }
    } catch (e) { showToast('Error deleting event'); }
}

function openEditModal(id) {
    const event = currentEvents.find(e => e.id === id);
    if (!event) return;
    document.getElementById('editEventId').value = event.id;
    document.getElementById('editEventName').value = event.name;
    document.getElementById('editEventDate').value = event.date;
    document.getElementById('editEventLocation').value = event.location;
    document.getElementById('editEventBudget').value = event.budget;
    openModal('editEventModal');
}

async function handleUpdateEvent() {
    const id = document.getElementById('editEventId').value;
    const name = document.getElementById('editEventName').value;
    const date = document.getElementById('editEventDate').value;
    const location = document.getElementById('editEventLocation').value;
    const budget = document.getElementById('editEventBudget').value;

    if (!name || !date || !location) return showToast('All fields required');

    try {
        const res = await fetch(`${API_URL}/events/${id}?t=${Date.now()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, date, location, budget: Number(budget) })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Event Updated Successfully!', true);
            closeModal('editEventModal');
            await loadDashboardData();
        } else {
            showToast('Update Failed: ' + (data.message || 'Error'));
        }
    } catch (e) { showToast('Error updating event'); }
}

async function deleteVendor(id) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    try {
        const res = await fetch(`${API_URL}/vendors/${id}?t=${Date.now()}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            showToast('Vendor Deleted Successfully!', true);
            await loadDashboardData();
        } else {
            showToast('Delete Failed: ' + (data.message || 'Error'));
        }
    } catch (e) { showToast('Error deleting vendor'); }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        const res = await fetch(`${API_URL}/tasks/${id}?t=${Date.now()}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            showToast('Task Deleted Successfully!', true);
            await loadDashboardData();
        } else {
            showToast('Delete Failed: ' + (data.message || 'Error'));
        }
    } catch (e) { showToast('Error deleting task'); }
}

// --- UPDATE MODAL LOGIC ---
let currentVendors = [];
let currentTasks = [];

function openEditVendorModal(id) {
    const v = currentVendors.find(vendor => vendor.id === id);
    if (!v) return;
    document.getElementById('editVendorId').value = v.id;
    document.getElementById('editVendorName').value = v.name;
    document.getElementById('editVendorCategory').value = v.category;
    document.getElementById('editVendorContact').value = v.contact;
    openModal('editVendorModal');
}

async function handleUpdateVendor() {
    const id = document.getElementById('editVendorId').value;
    const name = document.getElementById('editVendorName').value;
    const category = document.getElementById('editVendorCategory').value;
    const contact = document.getElementById('editVendorContact').value;

    try {
        const res = await fetch(`${API_URL}/vendors/${id}?t=${Date.now()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, contact })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Vendor Updated Successfully!', true);
            closeModal('editVendorModal');
            await loadDashboardData();
        } else {
            showToast('Update Failed: ' + (data.message || 'Error'));
        }
    } catch (e) { showToast('Error updating vendor'); }
}

function openEditTaskModal(id) {
    const t = currentTasks.find(task => task.id === id);
    if (!t) return;
    document.getElementById('editTaskId').value = t.id;
    document.getElementById('editTaskDesc').value = t.description;
    document.getElementById('editTaskAssign').value = t.assignedTo;
    document.getElementById('editTaskDeadline').value = t.deadline;
    openModal('editTaskModal');
}

async function handleUpdateTask() {
    const id = document.getElementById('editTaskId').value;
    const description = document.getElementById('editTaskDesc').value;
    const assignedTo = document.getElementById('editTaskAssign').value;
    const deadline = document.getElementById('editTaskDeadline').value;

    try {
        const res = await fetch(`${API_URL}/tasks/${id}?t=${Date.now()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, assignedTo, deadline })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Task Updated Successfully!', true);
            closeModal('editTaskModal');
            await loadDashboardData();
        } else {
            showToast('Update Failed: ' + (data.message || 'Error'));
        }
    } catch (e) { showToast('Error updating task'); }
}

function updateStat(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function renderEventsTable(events) {
    const tbody = document.getElementById('events-table-body');
    if (!tbody) return;
    tbody.innerHTML = events.map(e => `
        <tr>
            <td>#${e.id}</td>
            <td>${e.name}</td>
            <td>${e.date}</td>
            <td>${e.location}</td>
            <td>${e.budget.toLocaleString()} CFA</td>
            <td><span class="badge ${e.status.toLowerCase()}">${e.status}</span></td>
            <td>
                <button class="btn-primary" style="padding: 5px 10px; background: #f39c12;" onclick="openEditModal(${e.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-primary" style="padding: 5px 10px; background: #e74c3c;" onclick="deleteEvent(${e.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderVendorsTable(vendors) {
    currentVendors = vendors; // Store for edit
    const tbody = document.getElementById('vendors-table-body');
    if (!tbody) return;
    tbody.innerHTML = vendors.map(v => `
        <tr>
            <td>#${v.id}</td>
            <td>${v.name}</td>
            <td>${v.category}</td>
            <td>⭐ ${v.rating}</td>
            <td>${v.contact}</td>
            <td><span class="badge">${v.status}</span></td>
            <td>
                <button class="btn-primary" style="padding: 5px 10px; background: #f39c12;" onclick="openEditVendorModal(${v.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-primary" style="padding: 5px 10px; background: #e74c3c;" onclick="deleteVendor(${v.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}


// --- CHARTS & UI ---

function switchTab(tabName) {
    // Hide all views
    document.querySelectorAll('.content-view').forEach(el => el.classList.remove('active'));
    // Show specific view (simple mapping for demo: dashboard=dashboard, others map to sections)

    // For this simple demo, we map:
    // dashboard -> view-dashboard
    // events -> view-events
    // vendors -> view-vendors
    // tasks -> alert

    // Update sidebar active state
    document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active'));
    // This part is a bit tricky without unique IDs on LIs, but generic 'onclick' handles logic
    event.currentTarget.classList.add('active');

    const targetId = `view-${tabName}`;
    const targetEl = document.getElementById(targetId);
    if (targetEl) targetEl.classList.add('active');

    // If returning to dashboard, update title
    document.getElementById('pageTitle').textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
}

function renderTasksTable(tasks) {
    currentTasks = tasks; // Store for edit
    const tbody = document.getElementById('tasks-table-body');
    if (!tbody) return;
    tbody.innerHTML = tasks.map(t => `
        <tr>
            <td>${t.description}</td>
            <td>${t.assignedTo || 'Unassigned'}</td>
            <td>${t.deadline}</td>
            <td><span class="badge">${t.status}</span></td>
            <td>
                <button class="btn-primary" style="padding: 5px 10px; background: #f39c12;" onclick="openEditTaskModal(${t.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-primary" style="padding: 5px 10px; background: #e74c3c;" onclick="deleteTask(${t.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// --- MODAL LOGIC ---
function openModal(id) {
    document.getElementById(id).style.display = 'block';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}
// Close modal on outside click
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

function initCharts(stats, events) {
    const ctx1 = document.getElementById('budgetChart');
    const ctx2 = document.getElementById('regChart');

    // 1. Calculate Real Budget Data
    const totalBudget = events.reduce((sum, e) => sum + (Number(e.budget) || 0), 0);
    // For now, spent is 0 since we don't have expenses yet
    const spent = 0;
    const remaining = totalBudget - spent;

    if (ctx1) {
        // Destroy existing chart if it exists to prevent overlap on reload
        const existingChart = Chart.getChart(ctx1);
        if (existingChart) existingChart.destroy();

        new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Total Budget', 'Spent', 'Available'],
                datasets: [{
                    data: totalBudget > 0 ? [totalBudget, spent, remaining] : [0, 0, 1], // Placeholder 1 for empty look
                    backgroundColor: ['#1F2A44', '#2FA4A9', '#e5e7eb']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // 2. Calculate Monthly Registrations
    const monthlyCounts = new Array(6).fill(0);
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    events.forEach(e => {
        const date = new Date(e.date);
        const month = date.getMonth();
        if (month >= 0 && month < 6) {
            monthlyCounts[month]++;
        }
    });

    if (ctx2) {
        const existingChart2 = Chart.getChart(ctx2);
        if (existingChart2) existingChart2.destroy();

        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Events Created',
                    data: monthlyCounts,
                    backgroundColor: '#1F2A44',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

function showToast(msg, success = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = success ? '#4caf50' : '#333';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
