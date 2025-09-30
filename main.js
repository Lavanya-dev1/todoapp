import { addTask, deleteTask, toggleComplete, saveTasks } from "./taskFunction.js";

const input = document.getElementById("task-input");
const dateInput = document.getElementById("task-date");
const addButton = document.getElementById("add-task");
const labelInput = document.getElementById("task-label");
const addLabelBtn = document.getElementById("add-label");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-tasks");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


addLabelBtn.addEventListener("click", () => {
  const newLabel = prompt("Enter new label:");
  if (!newLabel || !newLabel.trim()) return;

  const exists = Array.from(labelInput.options).some(
    option => option.value.toLowerCase() === newLabel.trim().toLowerCase()
  );
  if (exists) return alert("Label already exists!");

  const option = document.createElement("option");
  option.value = newLabel.trim();
  option.textContent = newLabel.trim();
  labelInput.appendChild(option);
  labelInput.value = newLabel.trim();
});


function sortTasks() {
  const option = sortSelect.value;
  if(option === "none") return;

  const labelOrder = ["Work", "Personal", "Urgent"];

  if(option === "date-asc") {
    tasks.sort((a,b) => new Date(a.date) - new Date(b.date));
  } else if(option === "date-desc") {
    tasks.sort((a,b) => new Date(b.date) - new Date(a.date));
  } else if(option === "label") {
    tasks.sort((a,b) => labelOrder.indexOf(a.label) - labelOrder.indexOf(b.label));
  } else if(option === "completed") {
    tasks.sort((a,b) => a.completed - b.completed);
  }
}


window.renderTasks = function(filter = "all") {
  sortTasks();

  const today = new Date().toISOString().split("T")[0];
  const sections = {
    overdue: { container: document.getElementById("section-overdue"), list: document.getElementById("overdue-tasks") },
    today: { container: document.getElementById("section-today"), list: document.getElementById("today-tasks") },
    future: { container: document.getElementById("section-future"), list: document.getElementById("future-tasks") },
    completed: { container: document.getElementById("section-completed"), list: document.getElementById("completed-tasks") }
  };

  Object.values(sections).forEach(sec => {
    sec.list.innerHTML = "";
    sec.container.style.display = "none";
  });

  const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";

  tasks.forEach((task, index) => {
    if (searchQuery && !task.text.toLowerCase().includes(searchQuery)) return;

    const li = document.createElement("li");
    li.innerHTML = `<strong>Task:</strong> ${task.text} [${task.label}]<br> <small>Date: ${task.date}</small>`;

    
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "5px";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔";
    completeBtn.addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      updateTasks();
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => editTask(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.addEventListener("click", () => {
      tasks = deleteTask(tasks, index);
      updateTasks();
    });

    btnContainer.appendChild(completeBtn);
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    li.appendChild(btnContainer);

    
    if (task.completed) li.classList.add("completed");
    else if (task.date < today) li.classList.add("overdue");
    else if (task.date === today) li.classList.add("today");
    else li.classList.add("future");

    let sectionKey = task.completed ? "completed" :
                     task.date < today ? "overdue" :
                     task.date === today ? "today" : "future";

    if (filter === "all" || filter === sectionKey) {
      sections[sectionKey].list.appendChild(li);
      sections[sectionKey].container.style.display = "block";
    }
  });
};


async function updateTasks(currentFilter = "all") {
  renderTasks(currentFilter);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  await saveTasks(tasks);
}


addButton.addEventListener("click", () => {
  const taskText = input.value.trim();
  const taskLabel = labelInput.value;
  const taskDate = dateInput.value;

  if (!taskText || !taskDate) return;

  tasks = addTask(tasks, { text: taskText, label: taskLabel, date: taskDate, completed: false });

  input.value = "";
  dateInput.value = "";
  labelInput.value = "Personal";
  updateTasks();
});


function editTask(index) {
  const newText = prompt("Edit task title:", tasks[index].text);
  if (!newText || !newText.trim()) return;

  const newLabel = prompt("Edit task label (existing or new):", tasks[index].label);
  if (!newLabel || !newLabel.trim()) return;

  tasks[index].text = newText.trim();
  tasks[index].label = newLabel.trim();

  const exists = Array.from(labelInput.options).some(
    option => option.value.toLowerCase() === newLabel.trim().toLowerCase()
  );
  if (!exists) {
    const option = document.createElement("option");
    option.value = newLabel.trim();
    option.textContent = newLabel.trim();
    labelInput.appendChild(option);
  }

  updateTasks();
}


if (searchInput) {
  searchInput.addEventListener("input", () => renderTasks());
}


if (sortSelect) {
  sortSelect.addEventListener("change", () => renderTasks());
}


renderTasks();
