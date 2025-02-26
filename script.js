// ===== Firebase Initialization =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

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

// ===== Firebase Authentication (Google Sign-In) =====
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById("signInBtn").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Signed in as:", result.user.displayName);
      showFeedback("Signed in successfully!");
      // Books will load via onAuthStateChanged
    })
    .catch((error) => {
      console.error("Error during sign in:", error);
      showFeedback("Error signing in.");
    });
});

document.getElementById("signOutBtn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("Signed out successfully");
      showFeedback("Signed out successfully!");
    })
    .catch((error) => {
      console.error("Error signing out:", error);
      showFeedback("Error signing out.");
    });
});

// Monitor authentication state and update UI accordingly
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in: show books section and sign-out button.
    document.getElementById("books").style.display = "block";
    document.getElementById("signInBtn").style.display = "none";
    document.getElementById("signOutBtn").style.display = "inline-block";
    loadBooks();
  } else {
    // No user is signed in: hide books section, show sign-in button.
    document.getElementById("books").style.display = "none";
    document.getElementById("signInBtn").style.display = "inline-block";
    document.getElementById("signOutBtn").style.display = "none";
  }
});

// ===== Utility: Feedback =====
function showFeedback(message, elementId = "feedback") {
  const feedbackEl = document.getElementById(elementId);
  feedbackEl.textContent = message;
  setTimeout(() => (feedbackEl.textContent = ""), 3000);
}

// ===== CRUD Operations =====

// Load books from Firebase and display in the list
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

// Add or update a book via the form submission
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
      const bookDoc = doc(db, "books", bookId);
      await updateDoc(bookDoc, bookData);
      showFeedback("Book updated successfully!");
    } else {
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

// Edit book (populate form for update)
window.editBook = async function (id) {
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

// Delete book from Firebase
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

// ===== Biometric Authentication (WebAuthn) =====
document.getElementById("bioAuthBtn").addEventListener("click", async () => {
  if (window.PublicKeyCredential) {
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
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

// ===== Service Worker Registration =====
const sw = new URL('service-worker.js', import.meta.url);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(sw.href, {
    scope: 'https://github.com/Samar-deep/Booklogs.git'
  })
  .then(() => console.log('Service Worker Registered for scope:', sw.href))
  .catch(err => console.error('Service Worker Error:', err));
}

// ===== Initial load =====
window.addEventListener("load", loadBooks);
