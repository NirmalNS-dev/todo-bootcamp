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

const signupForm = document.getElementById("signup-form")

signupForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,20}$/
  if (!passwordCriteria.test(password)) {
    alert("Password must be at least 8 characters long and contain both letters and numbers.")
    return
  }

  if (!db) {
    alert("Database is not ready. Please try again in a moment.")
    return
  }

  const transaction = db.transaction(["users"], "readwrite")
  const objectStore = transaction.objectStore("users")
  const request = objectStore.get(username)

  request.onerror = (event) => {
    console.error("Error fetching user:", event.target.error)
  }

  request.onsuccess = (event) => {
    const user = event.target.result
    console.log(user)

    if (user) {
      alert("Username already exists. Please choose a different username.")
    } else {
      const newUser = { username, password, tasks: [] }
      const addRequest = objectStore.add(newUser)
      addRequest.onerror = (event) => {
        console.error("Error creating user:", event.target.error)
      }
      addRequest.onsuccess = (event) => {
        alert("Sign up successful!")
        localStorage.setItem("currentUser", JSON.stringify(username))
        window.location.href = "todo.html"
      }
    }
  }
})

