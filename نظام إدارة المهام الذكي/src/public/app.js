document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // DOM Elements Selection
  // ==========================================
  const taskForm = document.getElementById('taskForm');
  const taskTitleInput = document.getElementById('taskTitle');
  const taskDueDateInput = document.getElementById('taskDueDate');
  const taskPrioritySelect = document.getElementById('taskPriority');
  const taskDescriptionInput = document.getElementById('taskDescription');
  
  const tasksContainer = document.getElementById('tasksContainer');
  const searchBar = document.getElementById('searchBar');
  const statusFilters = document.getElementById('statusFilters');
  const priorityFilters = document.getElementById('priorityFilters');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const themeToggle = document.getElementById('themeToggle');
  
  // Stats Elements
  const totalTasksCount = document.getElementById('totalTasksCount');
  const activeTasksCount = document.getElementById('activeTasksCount');
  const completedTasksCount = document.getElementById('completedTasksCount');
  const completionPercent = document.getElementById('completionPercent');
  const progressBar = document.getElementById('progressBar');

  // Edit Modal Elements
  const editModal = document.getElementById('editModal');
  const editTaskForm = document.getElementById('editTaskForm');
  const editTaskId = document.getElementById('editTaskId');
  const editTaskTitle = document.getElementById('editTaskTitle');
  const editTaskDueDate = document.getElementById('editTaskDueDate');
  const editTaskPriority = document.getElementById('editTaskPriority');
  const editTaskDescription = document.getElementById('editTaskDescription');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  const toastContainer = document.getElementById('toastContainer');

  // ==========================================
  // Application State
  // ==========================================
  let tasks = [];
  let currentFilterStatus = 'all'; // all, active, completed
  let currentFilterPriority = 'all'; // all, low, medium, high
  let currentSearchQuery = '';
  let searchTimeout = null;

  // ==========================================
  // Theme Management (Dark / Light)
  // ==========================================
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  };

  const updateThemeIcon = (theme) => {
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  };

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(newTheme === 'light' ? 'تم تفعيل المظهر المضيء' : 'تم تفعيل المظهر المظلم', 'success');
  });

  // ==========================================
  // Toast Notifications
  // ==========================================
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = type === 'success' 
      ? 'fa-solid fa-circle-check' 
      : 'fa-solid fa-circle-exclamation';
      
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    toastContainer.appendChild(toast);
    
    // Auto remove toast after 3.5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  };

  // ==========================================
  // Stats Calculator & UI Updater
  // ==========================================
  const updateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    totalTasksCount.textContent = total;
    activeTasksCount.textContent = active;
    completedTasksCount.textContent = completed;
    completionPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;

    // Show/hide clear completed button
    if (completed > 0) {
      clearCompletedBtn.classList.remove('hide');
    } else {
      clearCompletedBtn.classList.add('hide');
    }
  };

  // ==========================================
  // Tasks APIs Requests
  // ==========================================
  const fetchTasks = async () => {
    try {
      const url = new URL('/api/tasks', window.location.origin);
      url.searchParams.set('filter', currentFilterStatus);
      url.searchParams.set('priority', currentFilterPriority);
      if (currentSearchQuery) {
        url.searchParams.set('q', currentSearchQuery);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.success) {
        tasks = data.tasks;
        renderTasksList();
        updateStats();
      } else {
        showToast('تعذر تحميل المهام من الخادم', 'error');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('تمت إضافة المهمة بنجاح', 'success');
        fetchTasks();
        taskForm.reset();
      } else {
        showToast(data.error || 'تعذر إضافة المهمة', 'error');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('تم تحديث المهمة بنجاح', 'success');
        closeEditModal();
        fetchTasks();
      } else {
        showToast(data.error || 'تعذر تحديث المهمة', 'error');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const toggleTaskStatus = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}/toggle`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        const statusMsg = data.completed ? 'اكتملت المهمة 🎉' : 'أعيد تنشيط المهمة';
        showToast(statusMsg, 'success');
        fetchTasks();
      } else {
        showToast(data.error || 'تعذر تغيير حالة المهمة', 'error');
      }
    } catch (err) {
      console.error('Error toggling task:', err);
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('تم حذف المهمة بنجاح', 'success');
        fetchTasks();
      } else {
        showToast(data.error || 'تعذر حذف المهمة', 'error');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const clearCompletedTasks = async () => {
    try {
      const response = await fetch('/api/tasks/clear-completed', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message || 'تم تنظيف المهام المكتملة', 'success');
        fetchTasks();
      } else {
        showToast(data.error || 'تعذر تنظيف المهام', 'error');
      }
    } catch (err) {
      console.error('Error clearing completed tasks:', err);
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  // ==========================================
  // Render Tasks to DOM
  // ==========================================
  const renderTasksList = () => {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
      tasksContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-square-check"></i>
          <h3>لا توجد مهام حالياً</h3>
          <p>أضف مهمة جديدة للبدء أو غير معايير البحث والفلترة</p>
        </div>
      `;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      const isCompleted = task.completed;
      
      // Check for overdue status
      let isOverdue = false;
      let formattedDate = '';
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        isOverdue = due < today && !isCompleted;
        
        // Format Date (YYYY-MM-DD)
        formattedDate = due.toISOString().split('T')[0];
      }

      // Priority Badge mapping
      let priorityClass = 'medium';
      if (task.priority === 'منخفضة') priorityClass = 'low';
      else if (task.priority === 'عالية') priorityClass = 'high';

      const taskItem = document.createElement('div');
      taskItem.className = `task-item ${isCompleted ? 'completed' : ''}`;
      taskItem.dataset.id = task.id;

      taskItem.innerHTML = `
        <label class="checkbox-container">
          <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <div class="task-content">
          <span class="task-item-title">${escapeHTML(task.title)}</span>
          ${task.description ? `<span class="task-item-desc">${escapeHTML(task.description)}</span>` : ''}
          <div class="task-meta">
            ${task.dueDate ? `
              <span class="task-due ${isOverdue ? 'overdue' : ''}">
                <i class="fa-regular fa-calendar"></i>
                ${formattedDate} ${isOverdue ? '(متأخرة)' : ''}
              </span>
            ` : ''}
            <span class="badge ${priorityClass}">${task.priority}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-action edit" title="تعديل"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-action delete" title="حذف"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;

      // Checkbox Event
      const checkbox = taskItem.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => toggleTaskStatus(task.id));

      // Edit Event
      const editBtn = taskItem.querySelector('.btn-action.edit');
      editBtn.addEventListener('click', () => openEditModal(task));

      // Delete Event
      const deleteBtn = taskItem.querySelector('.btn-action.delete');
      deleteBtn.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
          deleteTask(task.id);
        }
      });

      tasksContainer.appendChild(taskItem);
    });
  };

  // Helper function to escape HTML string
  const escapeHTML = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // ==========================================
  // Edit Modal Event Handlers
  // ==========================================
  const openEditModal = (task) => {
    editTaskId.value = task.id;
    editTaskTitle.value = task.title;
    editTaskDueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    editTaskPriority.value = task.priority;
    editTaskDescription.value = task.description || '';
    
    editModal.classList.add('active');
  };

  const closeEditModal = () => {
    editModal.classList.remove('active');
    editTaskForm.reset();
  };

  closeModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  
  // Close modal when clicking outside the box
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editTaskId.value;
    const taskData = {
      title: editTaskTitle.value,
      dueDate: editTaskDueDate.value || null,
      priority: editTaskPriority.value,
      description: editTaskDescription.value
    };
    updateTask(id, taskData);
  });

  // ==========================================
  // Form Submission for New Task
  // ==========================================
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskData = {
      title: taskTitleInput.value,
      dueDate: taskDueDateInput.value || null,
      priority: taskPrioritySelect.value,
      description: taskDescriptionInput.value
    };
    createTask(taskData);
  });

  // ==========================================
  // Toolbar Filters & Search Event Listeners
  // ==========================================
  statusFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-tab')) {
      statusFilters.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilterStatus = e.target.dataset.filter;
      fetchTasks();
    }
  });

  priorityFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-tab')) {
      priorityFilters.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilterPriority = e.target.dataset.priority;
      fetchTasks();
    }
  });

  searchBar.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    currentSearchQuery = e.target.value.trim();
    // Debounce search requests by 350ms
    searchTimeout = setTimeout(() => {
      fetchTasks();
    }, 350);
  });

  clearCompletedBtn.addEventListener('click', () => {
    if (confirm('هل أنت متأكد من مسح جميع المهام المكتملة؟')) {
      clearCompletedTasks();
    }
  });

  // ==========================================
  // App Initializer
  // ==========================================
  initTheme();
  fetchTasks();
});
