export function addTask(tasks, task) {
  const duplicate = tasks.some(t => 
    t.text.toLowerCase() === task.text.toLowerCase().trim() &&
    t.date === task.date
  );
  if (duplicate) {
    alert("Task already exists for this date!");
    return tasks; 
  }
  return [...tasks, task];
}


export function deleteTask(tasks, index) {
  return tasks.filter((_, i) => i !== index);
}


export function toggleComplete(tasks, index) {
  return tasks.map((task, i) => i === index ? { ...task, completed: !task.completed } : task);
}


export async function saveTasks(tasks) {
  return new Promise(resolve => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    resolve(true);
  });
}
