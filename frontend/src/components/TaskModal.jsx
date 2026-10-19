import { useEffect, useRef, useState } from 'react';
import { normalizeDate } from '../utils/date.js';

// Serve para criar ("Create Task") e editar ("Edit Task").
// Se `task` vier preenchida, o modal está em modo de edição.
export default function TaskModal({ task, onSave, onClose }) {
  const isEdit = Boolean(task);
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(normalizeDate(task?.due_date));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('O nome da tarefa é obrigatório.');
      titleRef.current?.focus();
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), dueDate: dueDate || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const heading = isEdit ? 'Edit Task' : 'Create Task';

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal-card w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl"
      >
        <h2 id="modal-title" className="text-xl font-extrabold">
          {heading}
        </h2>

        <label htmlFor="task-title" className="mt-5 block text-sm font-semibold text-muted">
          Task name
        </label>
        <input
          id="task-title"
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          placeholder="What needs to be done?"
          className="mt-1.5 w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-ink outline-none placeholder:text-muted focus:border-accent"
        />

        <label htmlFor="task-due" className="mt-4 block text-sm font-semibold text-muted">
          Due date (optional)
        </label>
        <input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-ink outline-none [color-scheme:dark] focus:border-accent"
        />

        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 font-semibold text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-brand rounded-lg px-5 py-2.5 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  );
}
