const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Não foi possível conectar à API. O backend está rodando?');
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Erro ao falar com a API.');
  }
  return data;
}

// GET /api/tasks?search=  ->  { tasks, total, completed }
export function fetchTasks(search = '', signal) {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return request(`/api/tasks${query}`, { signal });
}

// POST /api/tasks  { title, dueDate? }
export function createTask({ title, dueDate }) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, dueDate: dueDate || null }),
  });
}

// PATCH /api/tasks/:id  { completed?, title?, dueDate? }
export function updateTask(id, changes) {
  return request(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

// DELETE /api/tasks/:id
export function deleteTask(id) {
  return request(`/api/tasks/${id}`, { method: 'DELETE' });
}
