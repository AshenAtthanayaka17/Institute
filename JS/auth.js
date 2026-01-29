// auth.js
import { app } from './firebase-config.js';

import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const auth = getAuth(app);

// Global for phone confirmation result
let confirmationResult = null;

// Auto-redirect if already logged in (from login page)
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes('index.html')) {
        window.location.href = "HTML/home.html";  // adjust to "HTML/home.html" if needed
    }
});

// ──────────────────────────────────────────────
// 1. Email + Password Login
// ──────────────────────────────────────────────
window.loginWithEmail = async function () {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('error');

    errorEl.textContent = '';

    if (!email || !password) {
        errorEl.textContent = "Please enter email and password";
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "HTML/home.html";
    } catch (error) {
        let msg = "Login failed";
        switch (error.code) {
            case 'auth/invalid-email': msg = "Invalid email format"; break;
            case 'auth/user-not-found': msg = "No account found"; break;
            case 'auth/wrong-password': msg = "Incorrect password"; break;
            case 'auth/too-many-requests': msg = "Too many attempts – try later"; break;
            default: msg = error.message;
        }
        errorEl.textContent = msg;
        console.error(error);
    }
};

// ──────────────────────────────────────────────
// 2. Google Sign-In (popup)
// ──────────────────────────────────────────────
window.loginWithGoogle = async function () {
    const provider = new GoogleAuthProvider();
    const errorEl = document.getElementById('error');

    try {
        const result = await signInWithPopup(auth, provider);
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        console.log("Google login success:", result.user.email);
        window.location.href = "home.html";
    } catch (error) {
        let msg = "Google login failed";
        if (error.code === 'auth/popup-closed-by-user') {
            msg = "Popup was closed – try again";
        } else {
            msg = error.message;
        }
        errorEl.textContent = msg;
        console.error(error);
    }
};

// ──────────────────────────────────────────────
// 3. Phone Login (two steps: send OTP → verify)
// ──────────────────────────────────────────────
window.sendPhoneOTP = async function () {
    const phone = document.getElementById('phone').value.trim();
    const errorEl = document.getElementById('error');
    const otpGroup = document.getElementById('otp-group');

    errorEl.textContent = '';

    if (!phone || !phone.startsWith('+')) {
        errorEl.textContent = "Enter phone number with country code (e.g. +94712345678)";
        return;
    }

    try {
        // Create invisible reCAPTCHA verifier
        const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
                // reCAPTCHA solved → can proceed (auto in most cases)
            },
            'expired-callback': () => {
                errorEl.textContent = "reCAPTCHA expired – please try again";
            }
        });

        confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
        errorEl.textContent = "OTP sent! Check your phone.";
        otpGroup.style.display = 'block';  // show OTP input + verify button
    } catch (error) {
        let msg = error.message;
        if (error.code === 'auth/invalid-phone-number') {
            msg = "Invalid phone number format";
        } else if (error.code === 'auth/too-many-requests') {
            msg = "Too many attempts – try again later";
        }
        errorEl.textContent = msg;
        console.error(error);
    }
};

window.verifyPhoneOTP = async function () {
    const otp = document.getElementById('otp').value.trim();
    const errorEl = document.getElementById('error');

    if (!otp || otp.length < 4) {
        errorEl.textContent = "Enter the 6-digit OTP";
        return;
    }

    try {
        const credential = await confirmationResult.confirm(otp);
        console.log("Phone verified:", credential.user.phoneNumber);
        window.location.href = "HTML/home.html";
    } catch (error) {
        errorEl.textContent = error.code === 'auth/invalid-verification-code'
            ? "Wrong OTP – please check"
            : error.message;
        console.error(error);
    }
};