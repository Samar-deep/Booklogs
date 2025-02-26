// ===== Firebase Initialization & Imports =====
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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ===== Wait for DOM to load =====
document.addEventListener("DOMContentLoaded", () => {
  // Global variable for the user's books collection reference
  let userBooksCollection = null;

  // Element references
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const booksSection = document.getElementById("books");
  const feedbackEl = document.getElementById("feedback");
  const bookForm = document.getElementById("bookForm");
  const bookList = document.getElementById("bookList");

  // Biometric elements (new)
  const bioRegisterBtn = document.getElementById("bioRegisterBtn");
  const bioAuthBtn = document.getElementById("bioAuthBtn");
  const bioFeedback = document.getElementById("bioFeedback");

  // ===== Authentication Event Listeners =====
  signInBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Signed in as:", result.user.displayName);
        showFeedback("Signed in successfully!");
        // Books will load via onAuthStateChanged.
      })
      .catch((error) => {
        console.error("Error during sign in:", error);
        showFeedback("Error signing in.");
      });
  });

  signOutBtn.addEventListener("click", () => {
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

  // ===== Monitor Authentication State =====
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Set the user-specific books collection reference
      userBooksCollection = collection(db, "users", user.uid, "books");

      // Show books section and sign-out button
      booksSection.style.display = "block";
      signInBtn.style.display = "none";
      signOutBtn.style.display = "inline-block";
      loadBooks();
    } else {
      // Hide books section and show sign-in button
      booksSection.style.display = "none";
      signInBtn.style.display = "inline-block";
      signOutBtn.style.display = "none";
    }
  });

  // ===== Utility: Feedback =====
  function showFeedback(message, elementId = "feedback") {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      setTimeout(() => (el.textContent = ""), 3000);
    }
  }

  // ===== CRUD Operations =====

  // Load books from the user's subcollection and display in the list
  async function loadBooks() {
    if (!userBooksCollection) return;
    const querySnapshot = await getDocs(userBooksCollection);
    bookList.innerHTML = "";
    querySnapshot.forEach((docSnapshot) => {
      const book = docSnapshot.data();
      book.id = docSnapshot.id;
      const li = document.createElement("li");
      li.innerHTML = `<strong>${book.title}</strong> by ${book.author} (Genre: ${book.genre}, Rating: ${book.rating})
        <span>
          <button class="btn-edit" onclick="editBook('${book.id}')">Edit</button>
          <button class="btn-delete" onclick="deleteBook('${book.id}')">Delete</button>
        </span>`;
      bookList.appendChild(li);
    });
  }

  // Add or update a book via the form submission
  bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!userBooksCollection) {
      showFeedback("Please sign in first.");
      return;
    }
    const bookId = document.getElementById("bookId").value;
    const bookData = {
      title: document.getElementById("title").value,
      author: document.getElementById("author").value,
      genre: document.getElementById("genre").value,
      rating: document.getElementById("rating").value,
    };

    try {
      if (bookId) {
        // Update an existing book
        const bookDoc = doc(userBooksCollection, bookId);
        await updateDoc(bookDoc, bookData);
        showFeedback("Book updated successfully!");
      } else {
        // Add a new book
        await addDoc(userBooksCollection, bookData);
        showFeedback("Book added successfully!");
      }
      bookForm.reset();
      loadBooks();
    } catch (error) {
      console.error("Error writing document: ", error);
      showFeedback("Error saving book.");
    }
  });

  // Edit book (populate form for update)
  window.editBook = async function (id) {
    if (!userBooksCollection) return;
    const querySnapshot = await getDocs(userBooksCollection);
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

  // Delete book from the user's subcollection
  window.deleteBook = async function (id) {
    if (!userBooksCollection) return;
    try {
      await deleteDoc(doc(userBooksCollection, id));
      showFeedback("Book deleted successfully!");
      loadBooks();
    } catch (error) {
      console.error("Error deleting document: ", error);
      showFeedback("Error deleting book.");
    }
  };

  // ===== Biometric Registration (WebAuthn) =====
  bioRegisterBtn.addEventListener("click", async () => {
    // In a production app, generate a secure challenge on the server.
    const publicKeyCredentialCreationOptions = {
      challenge: Uint8Array.from("randomChallengeForReg", c => c.charCodeAt(0)),
      rp: {
        name: "Book Log App",
        id: window.location.hostname
      },
      user: {
        // In production, use a unique identifier from your backend.
        id: Uint8Array.from("uniqueUserId", c => c.charCodeAt(0)),
        name: auth.currentUser ? auth.currentUser.email : "user@example.com",
        displayName: auth.currentUser ? auth.currentUser.displayName : "User"
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 }  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred"
      },
      timeout: 60000,
      attestation: "none"
    };

    try {
      const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
      console.log("Biometric registration credential:", credential);
      bioFeedback.textContent = "Biometric registration successful!";
      // TODO: Send credential to your server to register this authenticator.
    } catch (error) {
      console.error("Biometric registration error:", error);
      bioFeedback.textContent = "Biometric registration failed.";
    }
  });

  // ===== Biometric Authentication (WebAuthn) =====
  bioAuthBtn.addEventListener("click", async () => {
    // In a production app, generate a secure challenge on the server and provide allowedCredentials.
    const publicKeyCredentialRequestOptions = {
      challenge: Uint8Array.from("randomChallengeForAuth", c => c.charCodeAt(0)),
      timeout: 60000,
      rpId: window.location.hostname,
      userVerification: "preferred"
      // allowCredentials: [ ... ] // Optionally list allowed credential IDs.
    };

    try {
      const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
      console.log("Biometric authentication assertion:", assertion);
      bioFeedback.textContent = "Biometric authentication successful!";
      // TODO: Send assertion to your server for verification.
    } catch (error) {
      console.error("Biometric authentication error:", error);
      bioFeedback.textContent = "Biometric authentication failed.";
    }
  });

  // ===== Service Worker Registration =====
  const swURL = new URL('service-worker.js', import.meta.url);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(swURL.href, {
      scope: '/Booklogs/'
    })
      .then(() => console.log('Service Worker Registered for scope:', swURL.href))
      .catch(err => console.error('Service Worker Error:', err));
  }

  // ===== Initial Load Check =====
  if (auth.currentUser) loadBooks();
});
