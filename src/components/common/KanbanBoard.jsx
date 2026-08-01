export default function KanbanBoard({ columns, tasks, onMove }) {
  return (
    <div className="kanban">
      {columns.map((column, index) => (
        <section key={column}>
          <header>
            <b>{column}</b>
            <span>{tasks.filter((task) => task.status === column).length}</span>
          </header>
          {tasks
            .filter((task) => task.status === column)
            .map((task) => (
              <article className="kanban-card" key={task.id}>
                <i />
                <b>{task.title}</b>
                <small>{task.branch}</small>
                <div>
                  <button disabled={!index} onClick={() => onMove(task.id, -1)}>
                    ←
                  </button>
                  <button
                    disabled={index === columns.length - 1}
                    onClick={() => onMove(task.id, 1)}
                  >
                    →
                  </button>
                </div>
              </article>
            ))}
        </section>
      ))}
    </div>
  );
}
