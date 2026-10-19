import { useCallback, useEffect, useState } from 'react';
import * as api from './api.js';
import useDebounce from './hooks/useDebounce.js';
import { sortTasks } from './utils/date.js';
import TaskItem from './components/TaskItem.jsx';
import TaskModal from './components/TaskModal.jsx';
import { ClipboardIcon, PlusIcon, SearchIcon } from './components/Icons.jsx';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [totals, setTotals] = useState({ total: 0, completed: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // null = fechado | {} = criando | tarefa = editando
  const [modalTask, setModalTask] = useState(null);

  // A busca só dispara depois que o usuário para de digitar.
  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async (term, signal) => {
    try {
      const data = await api.fetchTasks(term, signal);
      setTasks(sortTasks(data.tasks));
      setTotals({ total: data.total, completed: data.completed });
      setError('');
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(debouncedSearch, controller.signal);
    return () => controller.abort();
  }, [debouncedSearch, load]);

  const reload = () => load(debouncedSearch);

  async function handleSave({ title, dueDate }) {
    if (modalTask?.id) {
      await api.updateTask(modalTask.id, { title, dueDate });
    } else {
      await api.createTask({ title, dueDate });
    }
    setModalTask(null);
    await reload();
  }

  async function handleToggle(task) {
    try {
      await api.updateTask(task.id, { completed: !task.completed });
      await reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(task) {
    try {
      await api.deleteTask(task.id);
      await reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const searching = debouncedSearch.trim() !== '';

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-32 pt-10">
      <h1 className="text-center text-4xl font-extrabold tracking-tight">
        to<span className="text-brand">do.</span>
      </h1>

      <div className="relative mt-8">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks"
          aria-label="Buscar tarefas"
          className="w-full rounded-xl border border-line bg-surface py-3 pl-12 pr-4 text-ink outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      <div className="mt-8 flex items-center justify-between text-sm font-bold">
        <p className="flex items-center gap-2">
          Total tasks
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-ink">
            {totals.total}
          </span>
        </p>
        <p className="flex items-center gap-2">
          Completed
          <span className="bg-brand rounded-full px-2.5 py-0.5 text-xs text-white">
            {totals.completed} of {totals.total}
          </span>
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-16 text-center text-muted">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted">
          <ClipboardIcon width={56} height={56} strokeWidth={1.5} />
          <p className="font-bold text-ink">
            {searching ? 'No tasks match your search.' : 'You have no pending tasks.'}
          </p>
          {!searching && <p className="text-sm">Create tasks and organize your to-dos.</p>}
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={setModalTask}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setModalTask({})}
        aria-label="Create Task"
        className="bg-brand fixed bottom-8 right-8 grid h-14 w-14 place-items-center rounded-full text-white shadow-xl shadow-accent/30 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <PlusIcon width={26} height={26} strokeWidth={2.5} />
      </button>

      {modalTask && (
        <TaskModal
          key={modalTask.id ?? 'new'}
          task={modalTask.id ? modalTask : null}
          onSave={handleSave}
          onClose={() => setModalTask(null)}
        />
      )}
    </div>
  );
}
