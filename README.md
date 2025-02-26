Book Log Progressive Web App
Overview
The Book Log app lets you track, rate, and manage the books you’ve read. It uses Firebase Firestore for data persistence and biometric
authentication (via WebAuthn) for secure access. The app is built as a Progressive Web App (PWA) with offline capabilities and 
a responsive design.

Features
Book Management:
Add, edit, and delete book entries with details like title, author, genre, and rating.

Persistent Storage:
Data is stored in Firebase Firestore so that your books are available across sessions.

Biometric Authentication:
Securely sign in using built-in biometrics (e.g., fingerprint or face recognition).

Progressive Web App:
Includes a manifest and service worker for offline support and installability.

Responsive Design:
Optimized for both desktop and mobile devices

Deployment:

The app is deployed via GitHub Pages.
Ensure your service worker and asset paths are correctly configured for production.
Push your changes to GitHub, and the live site will update automatically.
Live Site
Check out the live version of the app here:
https://samar-deep.github.io/Booklogs

