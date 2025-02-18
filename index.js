let db
const dbName = "TodoAppDB"
const dbVersion = 1

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion)

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error)
      reject("Error opening database")
    }

    request.onsuccess = (event) => {
      db = event.target.result
      console.log("IndexedDB opened successfully")
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      db = event.target.result
      if (!db.objectStoreNames.contains("users")) {
        const objectStore = db.createObjectStore("users", { keyPath: "username" })
        objectStore.createIndex("password", "password", { unique: false })
        objectStore.createIndex("tasks", "tasks", { unique: false })
      }
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signin-form")

  openDatabase()
    .then(() => {
      signinForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const username = document.getElementById("username").value
        const password = document.getElementById("password").value

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
    })
    .catch((error) => {
      console.error("Failed to open database:", error)
    })
})

// Check if user is already logged in
const currentUser = localStorage.getItem("currentUser")
if (currentUser) {
  window.location.href = "todo.html"
}

