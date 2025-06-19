document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const newTaskInput = document.getElementById("new-task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const allTasksBtn = document.getElementById("all-tasks-btn");
  const activeTasksBtn = document.getElementById("active-tasks-btn");
  const completedTasksBtn = document.getElementById("completed-tasks-btn");
  const totalTasksSpan = document.getElementById("total-tasks");
  const completedTasksSpan = document.getElementById("completed-tasks");

  let tasks = [];
  let currentFilter = "all";

  // Load tasks from localStorage
  function loadTasks() {
    try {
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        // Validate loaded tasks structure
        tasks = tasks.filter(
          (task) =>
            task &&
            typeof task.id === "number" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
      }
    } catch (e) {
      console.error("Error loading tasks:", e);
      tasks = [];
    }
    renderTasks();
    updateStats();
  }

  // Save tasks to localStorage with validation
  function saveTasks() {
    try {
      const tasksToSave = tasks.filter(
        (task) => task.text.trim() !== "" && task.text.length <= 100
      );
      localStorage.setItem("tasks", JSON.stringify(tasksToSave));
    } catch (e) {
      console.error("Error saving tasks:", e);
    }
    updateStats();
  }

  // Validate task text
  function validateTaskText(text) {
    if (!text || text.trim() === "") {
      alert("Task cannot be empty!");
      return false;
    }
    if (text.length > 100) {
      alert("Task cannot exceed 100 characters!");
      return false;
    }
    return true;
  }

  // Add a new task with validation
  function addTask() {
    const taskText = newTaskInput.value.trim();
    if (!validateTaskText(taskText)) return;

    // Check for duplicate tasks (case insensitive)
    const isDuplicate = tasks.some(
      (task) => task.text.toLowerCase() === taskText.toLowerCase()
    );

    if (isDuplicate) {
      alert("This task already exists!");
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    newTaskInput.value = "";
    newTaskInput.focus();
  }

  // Toggle task completion status
  function toggleTaskCompletion(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }

  // Edit task text with comprehensive validation
  function editTask(taskId, currentText) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let newText = prompt("Edit your task:", currentText);
    if (newText === null) return; // User cancelled

    newText = newText.trim();
    if (!validateTaskText(newText)) return;

    // Check if actually changed
    if (newText === task.text) {
      alert("No changes made to the task.");
      return;
    }

    // Check for duplicate tasks (except current one)
    const isDuplicate = tasks.some(
      (t) => t.id !== taskId && t.text.toLowerCase() === newText.toLowerCase()
    );

    if (isDuplicate) {
      alert("This task already exists!");
      return;
    }

    task.text = newText;
    saveTasks();
    renderTasks();
  }

  // Delete a task with confirmation
  function deleteTask(taskId) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const userConfirmed = confirm(
      `Are you sure you want to delete this task?\n"${tasks[taskIndex].text}"`
    );
    if (!userConfirmed) return;

    tasks.splice(taskIndex, 1);
    saveTasks();
    renderTasks();

    // Show feedback if no tasks left
    if (tasks.length === 0) {
      setTimeout(() => alert("All tasks have been deleted!"), 100);
    }
  }

  // Filter tasks
  function filterTasks(filter) {
    currentFilter = filter;
    renderTasks();

    // Update active button styling
    allTasksBtn.classList.remove("secondary");
    activeTasksBtn.classList.remove("secondary");
    completedTasksBtn.classList.remove("secondary");

    switch (filter) {
      case "all":
        allTasksBtn.classList.add("secondary");
        break;
      case "active":
        activeTasksBtn.classList.add("secondary");
        break;
      case "completed":
        completedTasksBtn.classList.add("secondary");
        break;
    }
  }

  // Update stats
  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;

    totalTasksSpan.textContent = `${total} ${
      total === 1 ? "task" : "tasks"
    } total`;
    completedTasksSpan.textContent = `${completed} completed`;
  }

  // Render tasks based on current filter
  function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = [];
    switch (currentFilter) {
      case "all":
        filteredTasks = [...tasks];
        break;
      case "active":
        filteredTasks = tasks.filter((t) => !t.completed);
        break;
      case "completed":
        filteredTasks = tasks.filter((t) => t.completed);
        break;
    }

    if (filteredTasks.length === 0) {
      const emptyState = document.createElement("li");
      emptyState.className = "empty-state";

      switch (currentFilter) {
        case "active":
          emptyState.textContent = "No active tasks. Good job!";
          break;
        case "completed":
          emptyState.textContent = "No completed tasks yet. Keep working!";
          break;
        default:
          emptyState.textContent = "No tasks yet. Add a task to get started!";
      }

      taskList.appendChild(emptyState);
      return;
    }

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("li");
      taskItem.className = `task-item ${task.completed ? "completed" : ""}`;

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => {
        toggleTaskCompletion(task.id);
        editButton.disabled = task.completed; // Disable edit button if completed
      });

      // Task text
      const taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = task.text;

      // Action buttons
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "success";
      editBtn.textContent = "Edit";
      editBtn.disabled = task.completed; // Disable edit button if completed
      editBtn.addEventListener("click", () => editTask(task.id, task.text));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      taskItem.appendChild(checkbox);
      taskItem.appendChild(taskText);
      taskItem.appendChild(actionsDiv);

      taskList.appendChild(taskItem);
    });
  }

  // Event Listeners
  addTaskBtn.addEventListener("click", addTask);
  newTaskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  allTasksBtn.addEventListener("click", () => filterTasks("all"));
  activeTasksBtn.addEventListener("click", () => filterTasks("active"));
  completedTasksBtn.addEventListener("click", () => filterTasks("completed"));

  // Prevent form submission if input is empty
  document.querySelector(".container").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!newTaskInput.value.trim()) {
      alert("Please enter a task first!");
      newTaskInput.focus();
    }
  });

  // Initialize the app
  loadTasks();
});
