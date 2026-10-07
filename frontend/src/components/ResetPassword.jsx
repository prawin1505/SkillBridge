import { useState } from "react";
import "./ResetPassword.css";

import API_URL from "../config";

function ResetPassword({ onBackToLogin }) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // GET TOKEN FROM URL
    // =========================================================

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // =========================================================
    // HANDLE PASSWORD CHANGE
    // =========================================================

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);

        if (error) {
            setError("");
        }

        if (message) {
            setMessage("");
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);

        if (error) {
            setError("");
        }

        if (message) {
            setMessage("");
        }
    };

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        setMessage("");
        setError("");

        // -----------------------------------------------------
        // CHECK TOKEN
        // -----------------------------------------------------

        if (!token || !token.trim()) {
            setError(
                "Invalid or missing password reset link."
            );
            return;
        }

        // -----------------------------------------------------
        // CHECK PASSWORD
        // -----------------------------------------------------

        if (!newPassword) {
            setError("Please enter your new password.");
            return;
        }

        if (newPassword.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        // -----------------------------------------------------
        // CHECK CONFIRM PASSWORD
        // -----------------------------------------------------

        if (!confirmPassword) {
            setError("Please confirm your new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        token: token.trim(),
                        newPassword: newPassword,
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

            // -------------------------------------------------
            // HANDLE ERROR RESPONSE
            // -------------------------------------------------

            if (!response.ok) {
                let errorMessage =
                    "Unable to reset password.";

                if (response.status === 400) {
                    errorMessage =
                        typeof data === "string"
                            ? data
                            : data?.message ||
                              "The reset link is invalid or has expired.";
                } else if (response.status === 401) {
                    errorMessage =
                        typeof data === "string"
                            ? data
                            : data?.message ||
                              "The password reset link is no longer valid.";
                } else if (response.status === 404) {
                    errorMessage =
                        typeof data === "string"
                            ? data
                            : data?.message ||
                              "Password reset request was not found.";
                } else if (response.status === 500) {
                    errorMessage =
                        "Server error. Please try again later.";
                } else if (
                    typeof data === "string" &&
                    data
                ) {
                    errorMessage = data;
                } else if (data?.message) {
                    errorMessage = data.message;
                }

                throw new Error(errorMessage);
            }

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            setMessage(
                "Password reset successfully. You can now login with your new password."
            );

            setNewPassword("");
            setConfirmPassword("");
            setShowNewPassword(false);
            setShowConfirmPassword(false);

        } catch (err) {
            console.error(
                "RESET PASSWORD ERROR:",
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
                    "Unable to reset password. Please try again."
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

        if (onBackToLogin) {
            onBackToLogin();
        }
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="reset-page">

            <div className="reset-card">

                {/* =================================================
                    ICON
                ================================================= */}

                <div className="reset-icon">
                    🔐
                </div>

                {/* =================================================
                    TITLE
                ================================================= */}

                <h1>
                    Reset Password
                </h1>

                <p className="reset-description">
                    Enter your new password below.
                </p>

                {/* =================================================
                    SUCCESS
                ================================================= */}

                {message && (
                    <div
                        className="reset-success"
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
                        className="reset-error"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </div>
                )}

                {/* =================================================
                    FORM
                ================================================= */}

                {!message && (
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        {/* =========================================
                            NEW PASSWORD
                        ========================================= */}

                        <div className="reset-form-group">

                            <label htmlFor="new-password">
                                New Password
                            </label>

                            <div className="reset-password-wrapper">

                                <input
                                    id="new-password"
                                    className="reset-password-input"
                                    type={
                                        showNewPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={
                                        handleNewPasswordChange
                                    }
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={() =>
                                        setShowNewPassword(
                                            !showNewPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showNewPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    title={
                                        showNewPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showNewPassword
                                        ? "🙈"
                                        : "👁️"}
                                </button>

                            </div>

                            <small className="reset-password-hint">
                                Password must contain at least
                                6 characters.
                            </small>

                        </div>

                        {/* =========================================
                            CONFIRM PASSWORD
                        ========================================= */}

                        <div className="reset-form-group">

                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>

                            <div className="reset-password-wrapper">

                                <input
                                    id="confirm-password"
                                    className="reset-password-input"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={
                                        handleConfirmPasswordChange
                                    }
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    title={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword
                                        ? "🙈"
                                        : "👁️"}
                                </button>

                            </div>

                        </div>

                        {/* =========================================
                            RESET BUTTON
                        ========================================= */}

                        <button
                            type="submit"
                            className="reset-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Resetting..."
                                : "Reset Password"}
                        </button>

                    </form>
                )}

                {/* =================================================
                    BACK TO LOGIN
                ================================================= */}

                <button
                    type="button"
                    className="reset-back"
                    onClick={handleBackToLogin}
                    disabled={loading}
                >
                    ← Back to Login
                </button>

            </div>

        </div>
    );
}

export default ResetPassword;