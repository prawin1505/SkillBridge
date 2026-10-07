import { useState } from "react";
import "./ForgotPassword.css";

import API_URL from "../config";

function ForgotPassword({ onBackToLogin }) {
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // HANDLE EMAIL CHANGE
    // =========================================================

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        if (error) {
            setError("");
        }

        if (message) {
            setMessage("");
        }
    };

    // =========================================================
    // VALIDATE EMAIL
    // =========================================================

    const validateEmail = () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            return "Please enter your email address.";
        }

        if (!trimmedEmail.includes("@")) {
            return "Please enter a valid email address.";
        }

        return "";
    };

    // =========================================================
    // SEND RESET LINK
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        setMessage("");
        setError("");

        const trimmedEmail = email.trim();

        const validationError = validateEmail();

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: trimmedEmail,
                    }),
                }
            );

            let data = null;

            const contentType =
                response.headers.get("content-type");

            if (
                contentType &&
                contentType.includes("application/json")
            ) {
                try {
                    data = await response.json();
                } catch {
                    data = null;
                }
            } else {
                try {
                    data = await response.text();
                } catch {
                    data = null;
                }
            }

            if (!response.ok) {
                let errorMessage =
                    "Unable to send the password reset link.";

                if (response.status === 400) {
                    errorMessage =
                        typeof data === "string"
                            ? data
                            : data?.message ||
                              "Please enter a valid email address.";
                } else if (response.status === 404) {
                    errorMessage =
                        typeof data === "string"
                            ? data
                            : data?.message ||
                              "No account was found with this email address.";
                } else if (response.status === 500) {
                    errorMessage =
                        "Server error. Please try again later.";
                } else if (typeof data === "string" && data) {
                    errorMessage = data;
                } else if (data?.message) {
                    errorMessage = data.message;
                }

                throw new Error(errorMessage);
            }

            setMessage(
                "Password reset link has been sent to your email."
            );

            setEmail("");

        } catch (err) {
            console.error(
                "Forgot password request failed:",
                err
            );

            if (
                err instanceof TypeError &&
                err.message === "Failed to fetch"
            ) {
                setError(
                    "Unable to connect to the server. Please make sure the SkillBridge backend is running."
                );
            } else {
                setError(
                    err?.message ||
                    "Unable to send the password reset link. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // BACK TO LOGIN
    // =========================================================

    const handleBackToLogin = () => {
        if (loading) {
            return;
        }

        setError("");
        setMessage("");

        if (onBackToLogin) {
            onBackToLogin();
        }
    };

    return (
        <div className="forgot-page">

            <div className="forgot-card">

                {/* =================================================
                    ICON
                ================================================= */}

                <div className="forgot-icon">
                    🔐
                </div>


                {/* =================================================
                    TITLE
                ================================================= */}

                <h1>
                    Forgot Password?
                </h1>

                <p className="forgot-description">
                    Enter your registered email address
                    and we'll send you a password reset link.
                </p>


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {message && (
                    <div
                        className="forgot-success"
                        role="status"
                        aria-live="polite"
                    >
                        {message}
                    </div>
                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        className="forgot-error"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </div>
                )}


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <div className="forgot-form-group">

                        <label htmlFor="forgot-email">
                            Email Address
                        </label>

                        <input
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            autoComplete="email"
                            disabled={loading}
                        />

                    </div>


                    {/* =================================================
                        SUBMIT
                    ================================================= */}

                    <button
                        type="submit"
                        className="forgot-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"}
                    </button>

                </form>


                {/* =================================================
                    BACK TO LOGIN
                ================================================= */}

                <button
                    type="button"
                    className="forgot-back"
                    onClick={handleBackToLogin}
                    disabled={loading}
                >
                    ← Back to Login
                </button>

            </div>

        </div>
    );
}

export default ForgotPassword;