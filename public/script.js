let token = localStorage.getItem('token');
let userName = localStorage.getItem('userName');
let isLoginMode = true;
let editingId = null;

const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');

function showApp() {
  authSection.style.display = 'none';
  appSection.style.display = 'block';
  document.getElementById('welcome').textContent = 'Hi, ' + userName + ' ';
  loadTasks();
  loadStats();
}

function showAuth() {
  authSection.style.display = 'block';
  appSection.style.display = 'none';
}

if (token) {
  showApp();
} else {
  showAuth();
}

async function api(url, method, body) {
  const options = {
    method: method || 'GET',
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) {
    options.headers.Authorization = 'Bearer ' + token;
  }
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (res.status === 401 && token) {
    logout();
  }
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

document.getElementById('switchLink').addEventListener('click', (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  document.getElementById('authError').textContent = '';
  document.getElementById('authTitle').textContent = isLoginMode ? 'Login' : 'Register';
  document.getElementById('authBtn').textContent = isLoginMode ? 'Login' : 'Register';
  document.getElementById('name').style.display = isLoginMode ? 'none' : 'block';
  document.getElementById('switchText').textContent = isLoginMode ? 'New here?' : 'Already have an account?';
  document.getElementById('switchLink').textContent = isLoginMode ? 'Register' : 'Login';
});

document.getElementById('authBtn').addEventListener('click', async () => {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('authError');
  errorBox.textContent = '';

  try {
    let data;
    if (isLoginMode) {
      data = await api('/api/auth/login', 'POST', { email, password });
    } else {
      data = await api('/api/auth/register', 'POST', { name, email, password });
    }

    token = data.token;
    userName = data.user.name;
    localStorage.setItem('token', token);
    localStorage.setItem('userName', userName);
    document.getElementById('password').value = '';
    showApp();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  token = null;
  showAuth();
}

document.getElementById('logoutBtn').addEventListener('click', logout);

async function loadStats() {
  try {
    const stats = await api('/api/tasks/stats');
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statPending').textContent = stats.pending;
    document.getElementById('statDone').textContent = stats.done;
    document.getElementById('statOverdue').textContent = stats.overdue;
  } catch (err) {
    console.log(err.message);
  }
}

async function loadTasks() {
  const params = new URLSearchParams();
  const search = document.getElementById('search').value;
  const status = document.getElementById('filterStatus').value;
  const priority = document.getElementById('filterPriority').value;
  const sort = document.getElementById('sortBy').value;

  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (sort) params.append('sort', sort);

  try {
    const tasks = await api('/api/tasks?' + params.toString());
    showTasks(tasks);
  } catch (err) {
    console.log(err.message);
  }
}

function showTasks(tasks) {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<p class="empty">No tasks found</p>';
    return;
  }

  tasks.forEach((task) => {
    const div = document.createElement('div');
    div.className = 'task ' + task.priority + (task.status === 'done' ? ' done' : '');

    let dueText = '';
    if (task.dueDate) {
      const due = new Date(task.dueDate);
      const isOverdue = task.status === 'pending' && due < new Date();
      dueText = '<p>Due: <span class="' + (isOverdue ? 'overdue-text' : '') + '">' +
        due.toLocaleDateString() + (isOverdue ? ' (overdue)' : '') + '</span></p>';
    }

    div.innerHTML =
      '<h3></h3>' +
      '<p class="desc"></p>' +
      '<p>Priority: ' + task.priority + ' | Status: ' + task.status + '</p>' +
      dueText +
      '<div class="actions"></div>';

    div.querySelector('h3').textContent = task.title;
    div.querySelector('.desc').textContent = task.description;

    const actions = div.querySelector('.actions');

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'small';
    toggleBtn.textContent = task.status === 'done' ? 'Mark pending' : 'Mark done';
    toggleBtn.addEventListener('click', () => toggleStatus(task));

    const editBtn = document.createElement('button');
    editBtn.className = 'small grey';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(task));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'small danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task._id));

    actions.append(toggleBtn, editBtn, deleteBtn);
    list.appendChild(div);
  });
}

document.getElementById('saveBtn').addEventListener('click', async () => {
  const errorBox = document.getElementById('taskError');
  errorBox.textContent = '';

  const body = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    priority: document.getElementById('priority').value,
    dueDate: document.getElementById('dueDate').value || undefined,
  };

  try {
    if (editingId) {
      await api('/api/tasks/' + editingId, 'PUT', body);
    } else {
      await api('/api/tasks', 'POST', body);
    }
    resetForm();
    loadTasks();
    loadStats();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

function startEdit(task) {
  editingId = task._id;
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description;
  document.getElementById('priority').value = task.priority;
  document.getElementById('dueDate').value = task.dueDate ? task.dueDate.slice(0, 10) : '';
  document.getElementById('formTitle').textContent = 'Edit Task';
  document.getElementById('saveBtn').textContent = 'Update Task';
  document.getElementById('cancelBtn').style.display = 'inline-block';
  window.scrollTo(0, 0);
}

function resetForm() {
  editingId = null;
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('priority').value = 'medium';
  document.getElementById('dueDate').value = '';
  document.getElementById('formTitle').textContent = 'Add Task';
  document.getElementById('saveBtn').textContent = 'Add Task';
  document.getElementById('cancelBtn').style.display = 'none';
}

document.getElementById('cancelBtn').addEventListener('click', resetForm);

async function toggleStatus(task) {
  const newStatus = task.status === 'done' ? 'pending' : 'done';
  await api('/api/tasks/' + task._id, 'PUT', { status: newStatus });
  loadTasks();
  loadStats();
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await api('/api/tasks/' + id, 'DELETE');
  loadTasks();
  loadStats();
}

['search', 'filterStatus', 'filterPriority', 'sortBy'].forEach((id) => {
  document.getElementById(id).addEventListener('input', loadTasks);
});
