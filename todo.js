let db
const dbName = "TodoAppDB"
const dbVersion = 1

const request = indexedDB.open(dbName, dbVersion)

request.onerror = (event) => {
  console.error("IndexedDB error:", event.target.error)
}

request.onsuccess = (event) => {
  db = event.target.result
  // console.log("IndexedDB opened successfully");
  loadTasks()
}

const todoForm = document.getElementById("todo-form")
const todoList = document.getElementById("todo-list")
const logoutButton = document.getElementById("logout")
const editPopup = document.getElementById("edit-popup")
const editForm = document.getElementById("edit-form")
const cancelEditButton = document.getElementById("cancel-edit")

let currentUser = JSON.parse(localStorage.getItem("currentUser"))
let editingTaskId = null

if (!currentUser) {
  window.location.href = "index.html"
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const title = document.getElementById("todo-title").value
  const description = document.getElementById("todo-description").value
  const priority = document.getElementById("todo-priority").value
  const dueTime = document.getElementById("todo-due-time").value

  if (Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission !== "granted") {
        alert("You have denied notification permissions. Task will not be added until you provide permissions.");
        return; 
      }
    });
  }

  if (Notification.permission === "granted") {
    const task = {
      id: Date.now(),
      title,
      description,
      priority,
      dueTime,
      completed: false,
    }
    currentUser.tasks.push(task)
    updateUserTasks()
    renderTasks()
    todoForm.reset()

    setTaskTimer(task)
  }
})

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("currentUser")
  window.location.href = "index.html"
})

function updateUserTasks() {
  const transaction = db.transaction(["users"], "readwrite")
  const objectStore = transaction.objectStore("users")
  const request = objectStore.put(currentUser)

  request.onerror = (event) => {
    console.error("Error updating user tasks:", event.target.error)
  }

  request.onsuccess = (event) => {
    console.log("User tasks updated successfully")
  }
}

function loadTasks() {
  const transaction = db.transaction(["users"], "readonly")
  const objectStore = transaction.objectStore("users")
  const request = objectStore.get(currentUser)

  request.onerror = (event) => {
    console.error("Error fetching user tasks:", event.target.error)
  }

  request.onsuccess = (event) => {
    const user = event.target.result
    if (user) {
      currentUser = user
      renderTasks()
    }
  }
}

function renderTasks() {
  todoList.innerHTML = ""
  currentUser.tasks.forEach((task) => {
    const li = document.createElement("li")
    li.className = `priority-${task.priority}`
    li.innerHTML = `
            <div class="task-info">
                <span class="task-title">${task.title}</span>
                <span class="task-description">${task.description}</span>
                <span class="task-due-time">Due: ${new Date(task.dueTime).toLocaleString()}</span>
            </div>
            
            <div>
                <button onclick="editTask(${task.id})">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
                <button onclick="toggleTaskCompletion(${task.id})">${task.completed ? "Undo" : "Complete"}</button>
            </div>
        `
    todoList.appendChild(li)
  })
}

function editTask(id) {
  const task = currentUser.tasks.find((t) => t.id === id)
  if (task) {
    editingTaskId = id
    document.getElementById("edit-title").value = task.title
    document.getElementById("edit-description").value = task.description
    document.getElementById("edit-priority").value = task.priority
    document.getElementById("edit-due-time").value = task.dueTime
    editPopup.style.display = "block"
  }
}

editForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const task = currentUser.tasks.find((t) => t.id === editingTaskId)
  if (task) {
    task.title = document.getElementById("edit-title").value
    task.description = document.getElementById("edit-description").value
    task.priority = document.getElementById("edit-priority").value
    task.dueTime = document.getElementById("edit-due-time").value

    updateUserTasks()
    renderTasks()
    setTaskTimer(task)
    closeEditPopup()
  }
})

cancelEditButton.addEventListener("click", closeEditPopup)

function closeEditPopup() {
  editPopup.style.display = "none"
  editingTaskId = null
}

function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    currentUser.tasks = currentUser.tasks.filter((t) => t.id !== id);
    updateUserTasks();
    renderTasks();
  }
}

function toggleTaskCompletion(id) {
  const task = currentUser.tasks.find((t) => t.id === id)
  if (task) {
    task.completed = !task.completed
    updateUserTasks()
    renderTasks()
  }
}

function setTaskTimer(task) {
  const now = new Date()
  const dueTime = new Date(task.dueTime)
  const timeUntilDue = dueTime - now

  if (timeUntilDue > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        const notification = new Notification("Task Due", {
          body: `Task "${task.title}" is now due!`,
          icon: "https://img.icons8.com/?size=100&id=6902&format=png&color=000000",
        })
        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setTaskTimer(task)
          }
        })
      }
    }, timeUntilDue)
  }
}



renderTasks()

