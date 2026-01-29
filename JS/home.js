// home.js
import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const auth = getAuth(app);

// Protect the page – redirect to login if not authenticated
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // User is signed in → populate information
    document.getElementById("welcome-message").textContent =
        user.displayName ? `Welcome, ${user.displayName}` : "Welcome";

    document.getElementById("display-name").textContent =
        user.displayName || "—";

    document.getElementById("user-email").textContent =
        user.email || "—";

    document.getElementById("user-phone").textContent =
        user.phoneNumber || "—";

    document.getElementById("uid").textContent = user.uid;

    // Last sign-in time
    if (user.metadata?.lastSignInTime) {
        const date = new Date(user.metadata.lastSignInTime);
        document.getElementById("last-signin").textContent =
            date.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
    } else {
        document.getElementById("last-signin").textContent = "—";
    }

    // Determine main provider
    let provider = "Email/Password";
    if (user.providerData && user.providerData.length > 0) {
        const mainProvider = user.providerData[0];
        if (mainProvider.providerId === 'google.com') {
            provider = "Google";
        } else if (mainProvider.providerId === 'phone') {
            provider = "Phone Number";
        }
    }
    document.getElementById("provider").textContent = provider;
});

// Logout function (global so it can be called from onclick)
window.logout = async function () {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (err) {
        console.error("Logout failed:", err);
        alert("Logout failed. Please try again.");
    }
};