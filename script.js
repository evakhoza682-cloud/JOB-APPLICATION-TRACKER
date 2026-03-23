// ============================================
// JOB APPLICATION TRACKER - FULL FUNCTIONALITY
// ============================================

// ---------- DATA STORAGE ----------
let applications = [];

// ---------- LOAD DATA ON PAGE START ----------
document.addEventListener('DOMContentLoaded', function() {
    loadApplications();
    updateStats();
    renderApplications();
    setupFilters();
});

// ---------- FORM SUBMISSION ----------
document.getElementById('application-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const company = document.getElementById('company').value;
    const role = document.getElementById('role').value;
    const date = document.getElementById('date').value;
    const status = document.getElementById('status').value;
    
    // Validate form
    if (!company || !role || !date || !status) {
        alert('Please fill in all fields!');
        return;
    }
    
    // Create new application object
    const newApplication = {
        id: Date.now(),
        company: company,
        role: role,
        date: date,
        status: status
    };
    
    // Add to array
    applications.push(newApplication);
    
    // Save and update
    saveApplications();
    updateStats();
    renderApplications();
    
    // Reset form
    e.target.reset();
    
    // Show success message
    showNotification('Application added successfully!', 'success');
});

// ---------- SAVE TO LOCALSTORAGE ----------
function saveApplications() {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
}

// ---------- LOAD FROM LOCALSTORAGE ----------
function loadApplications() {
    const stored = localStorage.getItem('jobApplications');
    if (stored) {
        applications = JSON.parse(stored);
    }
}

// ---------- UPDATE STATISTICS ----------
function updateStats() {
    const total = applications.length;
    const applied = applications.filter(a => a.status === 'Applied').length;
    const interview = applications.filter(a => a.status === 'Interview').length;
    const offer = applications.filter(a => a.status === 'Offer').length;
    
    document.getElementById('total-apps').textContent = total;
    document.getElementById('stat-applied').textContent = applied;
    document.getElementById('stat-interview').textContent = interview;
    document.getElementById('stat-offer').textContent = offer;
}

// ---------- RENDER ALL APPLICATIONS ----------
function renderApplications() {
    const container = document.getElementById('applications-container');
    container.innerHTML = '';
    
    if (applications.length === 0) {
        container.innerHTML = `
            <div class="no-applications">
                <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                No applications yet. Start tracking your journey!
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedApps = [...applications].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedApps.forEach(app => {
        const card = createApplicationCard(app);
        container.appendChild(card);
    });
}

// ---------- CREATE APPLICATION CARD ----------
function createApplicationCard(app) {
    const card = document.createElement('div');
    card.className = 'application-card';
    card.dataset.id = app.id;
    
    card.innerHTML = `
        <div class="application-info">
            <h3><i class="fas fa-building"></i> ${escapeHtml(app.company)}</h3>
            <p><i class="fas fa-briefcase"></i> ${escapeHtml(app.role)}</p>
            <p><i class="fas fa-calendar"></i> ${formatDate(app.date)}</p>
            <select class="status-select ${app.status}" onchange="updateStatus(${app.id}, this.value)">
                <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>📝 Applied</option>
                <option value="Interview" ${app.status === 'Interview' ? 'selected' : ''}>🎯 Interview</option>
                <option value="Offer" ${app.status === 'Offer' ? 'selected' : ''}>🎉 Offer</option>
                <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>❌ Rejected</option>
            </select>
        </div>
        <div class="application-actions">
            <button class="edit-btn" onclick="editApplication(${app.id})" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" onclick="deleteApplication(${app.id})" title="Delete">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    return card;
}

// ---------- UPDATE STATUS ----------
window.updateStatus = function(id, newStatus) {
    const app = applications.find(a => a.id === id);
    if (app) {
        app.status = newStatus;
        saveApplications();
        updateStats();
        renderApplications();
        showNotification(`Status updated to ${newStatus}`, 'info');
    }
};

// ---------- DELETE APPLICATION ----------
window.deleteApplication = function(id) {
    if (confirm('Are you sure you want to delete this application?')) {
        const appName = applications.find(a => a.id === id)?.company;
        applications = applications.filter(app => app.id !== id);
        saveApplications();
        updateStats();
        renderApplications();
        showNotification(`${appName} has been deleted`, 'warning');
    }
};

// ---------- EDIT APPLICATION ----------
window.editApplication = function(id) {
    const app = applications.find(a => a.id === id);
    if (!app) return;
    
    // Fill form with current values
    document.getElementById('company').value = app.company;
    document.getElementById('role').value = app.role;
    document.getElementById('date').value = app.date;
    document.getElementById('status').value = app.status;
    
    // Remove old application
    applications = applications.filter(a => a.id !== id);
    saveApplications();
    updateStats();
    renderApplications();
    
    // Scroll to form
    document.querySelector('.add-form').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Edit the details and click Save', 'info');
};

// ---------- FORMAT DATE ----------
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// ---------- SETUP FILTERS ----------
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.dataset.filter;
            
            // Filter applications
            filterApplications(filter);
        });
    });
}

// ---------- FILTER APPLICATIONS ----------
function filterApplications(filter) {
    const container = document.getElementById('applications-container');
    container.innerHTML = '';
    
    let filteredApps = applications;
    if (filter !== 'all') {
        filteredApps = applications.filter(a => a.status === filter);
    }
    
    if (filteredApps.length === 0) {
        container.innerHTML = `
            <div class="no-applications">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                No ${filter} applications found.
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedApps = [...filteredApps].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedApps.forEach(app => {
        const card = createApplicationCard(app);
        container.appendChild(card);
    });
}

// ---------- SHOW NOTIFICATION ----------
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#ef4444' : '#8b5cf6'};
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ---------- ADD ANIMATION STYLES ----------
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ---------- ESCAPE HTML TO PREVENT XSS ----------
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}