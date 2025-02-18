const currentUser = localStorage.getItem("currentUser")
if (currentUser) {
  window.location.href = "todo.html"
}

let db
const dbName = "TodoAppDB"
const dbVersion = 1

const request = indexedDB.open(dbName, dbVersion)

request.onerror = (event) => {
  console.error("IndexedDB error:", event.target.error)
}

request.onsuccess = (event) => {
  db = event.target.result
  console.log("IndexedDB opened successfully")
}

request.onupgradeneeded = (event) => {
  db = event.target.result
  if (!db.objectStoreNames.contains("users")) {
    const objectStore = db.createObjectStore("users", { keyPath: "username" })
    objectStore.createIndex("password", "password", { unique: false })
    objectStore.createIndex("tasks", "tasks", { unique: false })
  }
}

const signinForm = document.getElementById("signin-form")

signinForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  if (!db) {
    alert("Database is not ready. Please try again in a moment.")
    return
  }

  const transaction = db.transaction(["users"], "readonly")
  const objectStore = transaction.objectStore("users")
  const request = objectStore.get(username)

  request.onerror = (event) => {
    console.error("Error fetching user:", event.target.error)
  }

  request.onsuccess = (event) => {
    const user = event.target.result
    if (user && user.password === password) {
      localStorage.setItem("currentUser", JSON.stringify(user.username))
      window.location.href = "todo.html"
    } else {
      alert("Invalid username or password. If you are new to this application please Sign Up")
    }
  }
})

