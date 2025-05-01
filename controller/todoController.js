import Todo from "../model/todoModel.js"; // Assuming you named it todoModel.js

// Create a new todo
export const create = async (req, res) => {
  try {
    const todoData = new Todo(req.body);
    const savedTodo = await todoData.save();
    res.status(200).json(savedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Fetch all todos
export const fetch = async (req, res) => {
  try {
    const todos = await Todo.find();
    if (todos.length === 0) {
      return res.status(404).json({ message: "No todos found." });
    }
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: "Internal Server error." });
  }
};

// Update a todo by ID
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const todoExist = await Todo.findById(id);
    if (!todoExist) {
      return res.status(404).json({ message: "Todo not found." });
    }

    const updatedTodo = await Todo.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
};

// Delete a todo by ID
export const deleteTodo = async (req, res) => {
  try {
    const id = req.params.id;
    const todoExist = await Todo.findById(id);
    if (!todoExist) {
      return res.status(404).json({ message: "Todo not found." });
    }
    await Todo.findByIdAndDelete(id);
    res.status(200).json({ message: "Todo deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
};
