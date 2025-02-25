// ===== Firebase Initialization =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzTbmSuxzvpCJF27J7I5aTPhVY36U2scs",
  authDomain: "booksorganizer-c96ac.firebaseapp.com",
  projectId: "booksorganizer-c96ac",
  storageBucket: "booksorganizer-c96ac.firebasestorage.app",
  messagingSenderId: "347259427416",
  appId: "1:347259427416:web:01d088cc84282c7f9e482d",
  measurementId: "G-HLCSC3Z2KM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const booksCollection = collection(db, "books");

// ===== Utility: Feedback =====
function showFeedback(message, elementId = "feedback") {
  const feedbackEl = document.getElementById(elementId);
  feedbackEl.textContent = message;
  setTimeout(() => (feedbackEl.textContent = ""), 3000);
}

// ===== CRUD Operations =====

// Load books from Firebase
async function loadBooks() {
  const querySnapshot = await getDocs(booksCollection);
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";
  querySnapshot.forEach((docSnapshot) => {
    const book = docSnapshot.data();
    book.id = docSnapshot.id;
    const li = document.createElement("li");
    li.innerHTML = `<strong>${book.title}</strong> by ${book.author} (Genre: ${book.genre}, Rating: ${book.rating})
      <span>
        <button onclick="editBook('${book.id}')">Edit</button>
        <button onclick="deleteBook('${book.id}')">Delete</button>
      </span>`;
    bookList.appendChild(li);
  });
}

// Add or update a book
document.getElementById("bookForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const bookId = document.getElementById("bookId").value;
  const bookData = {
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    genre: document.getElementById("genre").value,
    rating: document.getElementById("rating").value,
  };

  try {
    if (bookId) {
      // Update existing book
      const bookDoc = doc(db, "books", bookId);
      await updateDoc(bookDoc, bookData);
      showFeedback("Book updated successfully!");
    } else {
      // Add new book
      await addDoc(booksCollection, bookData);
      showFeedback("Book added successfully!");
    }
    document.getElementById("bookForm").reset();
    loadBooks();
  } catch (error) {
    console.error("Error writing document: ", error);
    showFeedback("Error saving book.");
  }
});

// Edit book (populate form)
window.editBook = async function (id) {
  const bookDoc = doc(db, "books", id);
  const querySnapshot = await getDocs(booksCollection);
  querySnapshot.forEach((docSnapshot) => {
    if (docSnapshot.id === id) {
      const book = docSnapshot.data();
      document.getElementById("bookId").value = id;
      document.getElementById("title").value = book.title;
      document.getElementById("author").value = book.author;
      document.getElementById("genre").value = book.genre;
      document.getElementById("rating").value = book.rating;
    }
  });
};

// Delete book
window.deleteBook = async function (id) {
  try {
    await deleteDoc(doc(db, "books", id));
    showFeedback("Book deleted successfully!");
    loadBooks();
  } catch (error) {
    console.error("Error deleting document: ", error);
    showFeedback("Error deleting book.");
  }
};

// ===== AI Chatbot Integration =====

// Dummy chatbot responses for illustration.
// In a real-world scenario, you might integrate with an AI service API.
document.getElementById("chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;
  
  addChatMessage("User", message);
  // Simulate AI response
  setTimeout(() => {
    addChatMessage("AI", "Here’s a suggestion: try sorting your books by genre!");
  }, 1000);
  input.value = "";
});

function addChatMessage(sender, message) {
  const chatWindow = document.getElementById("chatWindow");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message");
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ===== Biometric Authentication (WebAuthn) =====

document.getElementById("bioAuthBtn").addEventListener("click", async () => {
  // Check if the browser supports WebAuthn
  if (window.PublicKeyCredential) {
    try {
      // Note: In a production scenario, you must create proper PublicKeyCredentialRequestOptions
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          // Relying party and user details would normally come from your server
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: "preferred"
        }
      });
      console.log("Biometric credential obtained:", credential);
      document.getElementById("authFeedback").textContent = "Biometric authentication successful!";
    } catch (err) {
      console.error("Biometric auth error:", err);
      document.getElementById("authFeedback").textContent = "Biometric authentication failed.";
    }
  } else {
    document.getElementById("authFeedback").textContent = "WebAuthn not supported on this browser.";
  }
});

const sw = new URL('service-worker.js', import.meta.url)
if ('serviceWorker' in navigator) {
 const s = navigator.serviceWorker;
 s.register(sw.href, {
 scope: 'https://github.com/Samar-deep/Booklogs.git'
 })
 .then(_ => console.log('Service Worker Registered for scope:', sw.href,
'with', import.meta.url))
 .catch(err => console.error('Service Worker Error:', err));
}

// ===== Initial load =====
window.addEventListener("load", loadBooks);
