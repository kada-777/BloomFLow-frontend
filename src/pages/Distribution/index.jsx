import { useState } from "react";
import { PageHeader } from "../../components/ui";
import KanbanBoard from "../../components/common/KanbanBoard";

const columns = ["Requested", "Approved", "Packing", "Shipping", "Delivered"];

export default function Distribution() {
  const [tasks, setTasks] = useState([]);
  const move = (id, direction) =>
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status:
                columns[
                  Math.max(
                    0,
                    Math.min(
                      columns.length - 1,
                      columns.indexOf(task.status) + direction,
                    ),
                  )
                ],
            }
          : task,
      ),
    );

  return (
    <>
      <PageHeader
        title="Distribution board"
        subtitle="Move requests through the fulfilment flow"
        action="+ New request"
      />
      <KanbanBoard columns={columns} tasks={tasks} onMove={move} />
    </>
  );
}
