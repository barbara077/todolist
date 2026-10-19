import { CalendarIcon, CheckIcon, PencilIcon, TrashIcon } from './Icons.jsx';
import { formatDate, isOverdue } from '../utils/date.js';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);
  const completed = Boolean(task.completed);

  return (
    <li className="task-item flex items-center gap-4 rounded-xl border border-line bg-surface px-4 py-3.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={completed ? 'Marcar como pendente' : 'Marcar como concluída'}
        onClick={() => onToggle(task)}
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          completed ? 'bg-brand border-transparent' : 'border-muted hover:border-accent'
        }`}
      >
        {completed && <CheckIcon width={14} height={14} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`break-words font-semibold ${
            completed ? 'text-muted line-through' : overdue ? 'text-danger' : 'text-ink'
          }`}
        >
          {task.title}
        </p>

        {(task.due_date || overdue) && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            {task.due_date && (
              <span className="inline-flex items-center gap-1">
                <CalendarIcon width={13} height={13} />
                {formatDate(task.due_date)}
              </span>
            )}
            {overdue && (
              <span className="rounded-full bg-danger/15 px-2 py-0.5 font-semibold text-danger">
                Em atraso
              </span>
            )}
          </div>
        )}
      </div>

      <div className="task-actions flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Editar tarefa ${task.title}`}
          className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Excluir tarefa ${task.title}`}
          className="rounded-lg p-2 text-muted transition hover:bg-danger/15 hover:text-danger focus-visible:outline-2 focus-visible:outline-danger"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}
