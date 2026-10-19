// O backend devolve due_date como 'YYYY-MM-DD' (dateStrings: true).
// Trabalhamos com strings para evitar problemas de fuso horário.
export function normalizeDate(value) {
  return value ? String(value).slice(0, 10) : '';
}

export function todayString() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

export function formatDate(value) {
  const [y, m, d] = normalizeDate(value).split('-');
  return y ? `${d}/${m}/${y}` : '';
}

// Em atraso: tem data limite, a data já passou e a tarefa ainda está pendente.
export function isOverdue(task) {
  const due = normalizeDate(task.due_date);
  return Boolean(due) && !task.completed && due < todayString();
}

// Data mais próxima primeiro; sem data vai para o fim; empate: mais recente primeiro.
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const da = normalizeDate(a.due_date);
    const db = normalizeDate(b.due_date);
    if (da && !db) return -1;
    if (!da && db) return 1;
    if (da !== db) return da < db ? -1 : 1;
    return String(b.created_at).localeCompare(String(a.created_at));
  });
}
