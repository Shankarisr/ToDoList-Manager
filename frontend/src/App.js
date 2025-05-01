import React, { useState, useEffect } from "react";
import "./App.css"; // Optional: For custom styles

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [filter, setFilter] = useState("all"); // all | done | todo

  // Fetch tasks from backend on initial load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/todos");
        const todos = await response.json();
        const formatted = todos.map((t) => ({
          text: t.text,
          completed: t.completed,
          _id: t._id, // Ensure you include the _id for updating tasks later
        }));
        setTasks(formatted);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Handle adding or updating task
  const handleAddOrUpdate = async () => {
    if (taskInput.trim() === "") return;

    if (editIndex !== null) {
      // Handle task update
      const updatedTask = { ...tasks[editIndex], text: taskInput };

      try {
        const response = await fetch(
          `http://localhost:5000/api/todos/${updatedTask._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTask),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        // Update the task list in frontend state
        const updatedTasks = tasks.map((task, index) =>
          index === editIndex ? updatedTask : task
        );
        setTasks(updatedTasks);
        setEditIndex(null);
      } catch (error) {
        console.error("Failed to save task:", error);
      }
    } else {
      // Handle task creation
      const newTask = { text: taskInput, completed: false };

      try {
        const response = await fetch("http://localhost:5000/api/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });

        const savedTask = await response.json();
        setTasks([
          ...tasks,
          {
            text: savedTask.text,
            completed: savedTask.completed,
            _id: savedTask._id,
          },
        ]);
      } catch (error) {
        console.error("Failed to save task:", error);
      }
    }

    setTaskInput("");
  };

  // Handle toggling task completion
  const handleToggle = async (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);

    // Update the task in the database
    try {
      await fetch(`http://localhost:5000/api/todos/${updated[index]._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated[index]),
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  // Handle task deletion
  const handleDelete = async (index) => {
    const taskToDelete = tasks[index];

    try {
      await fetch(`http://localhost:5000/api/todos/${taskToDelete._id}`, {
        method: "DELETE",
      });

      const updated = tasks.filter((_, i) => i !== index);
      setTasks(updated);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Handle task editing
  const handleEdit = (index) => {
    setTaskInput(tasks[index].text);
    setEditIndex(index);
  };

  // Handle delete done tasks
  const handleDeleteDone = async () => {
    try {
      // Delete done tasks from backend
      const completedTasks = tasks.filter((task) => task.completed);
      await Promise.all(
        completedTasks.map((task) =>
          fetch(`http://localhost:5000/api/todos/${task._id}`, {
            method: "DELETE",
          })
        )
      );

      // Update frontend state after deletion
      setTasks(tasks.filter((task) => !task.completed));
    } catch (error) {
      console.error("Failed to delete done tasks:", error);
    }
  };

  // Handle delete all tasks
  const handleDeleteAll = async () => {
    try {
      // Delete all tasks from backend
      await Promise.all(
        tasks.map((task) =>
          fetch(`http://localhost:5000/api/todos/${task._id}`, {
            method: "DELETE",
          })
        )
      );

      // Update frontend state after deletion
      setTasks([]);
    } catch (error) {
      console.error("Failed to delete all tasks:", error);
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "done") return task.completed;
    if (filter === "todo") return !task.completed;
    return true;
  });

  return (
    <div className="container">
      <div className="todo-input-section">
        <br />
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="New Todo"
        />
        <button onClick={handleAddOrUpdate}>
          {editIndex !== null ? "Save task" : "Add new task"}
        </button>
      </div>

      <h2>TodoList</h2>

      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("done")}>Done</button>
        <button onClick={() => setFilter("todo")}>Todo</button>
      </div>

      <ul className="task-list">
        {filteredTasks.map((task, index) => (
          <li key={task._id} className="task-item">
            <span
              className={task.completed ? "done" : ""}
              onClick={() => handleToggle(index)}
            >
              {task.text}
            </span>
            <div>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(index)}
              />
              <button onClick={() => handleEdit(index)}>✏️</button>
              <button onClick={() => handleDelete(index)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="bottom-actions">
        <button onClick={handleDeleteDone} className="delete-btn">
          Delete done tasks
        </button>
        <button onClick={handleDeleteAll} className="delete-btn">
          Delete all tasks
        </button>
      </div>
    </div>
  );
}

export default App;
