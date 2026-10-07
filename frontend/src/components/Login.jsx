import { useState } from "react";
import "./Login.css";

import API_URL from "../config";

function Login({ onLogin, onRegister, onForgotPassword }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =========================================================
    // LOGIN
    // =========================================================

    const handleLogin = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: trimmedEmail,
                        password,
                    }),
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            // =================================================
            // LOGIN ERROR
            // =================================================

            if (!response.ok) {
                let message =
                    "Login failed. Please check your credentials.";

                if (response.status === 400) {
                    message =
                        data?.message ||
                        "Please enter valid login details.";
                } else if (response.status === 401) {
                    message =
                        data?.message ||
                        "Invalid email or password.";
                } else if (response.status === 403) {
                    message =
                        data?.message ||
                        "Your account does not have permission to login.";
                } else if (response.status === 500) {
                    message =
                        "Server error. Please try again later.";
                } else if (data?.message) {
                    message = data.message;
                }

                throw new Error(message);
            }

            // =================================================
            // VALIDATE LOGIN RESPONSE
            // =================================================

            if (!data?.accessToken) {
                throw new Error(
                    "Login succeeded, but no authentication token was received."
                );
            }

            // =================================================
            // SAVE JWT
            // =================================================

            localStorage.setItem(
                "token",
                data.accessToken
            );

            if (
                data.userId !== undefined &&
                data.userId !== null
            ) {
                localStorage.setItem(
                    "userId",
                    String(data.userId)
                );
            }

            if (data.email) {
                localStorage.setItem(
                    "email",
                    data.email
                );
            } else {
                localStorage.setItem(
                    "email",
                    trimmedEmail
                );
            }

            if (data.role) {
                localStorage.setItem(
                    "role",
                    data.role
                );
            }

            // =================================================
            // TELL APP LOGIN SUCCEEDED
            // =================================================

            if (onLogin) {
                onLogin(data);
            }

        } catch (error) {
            console.error(
                "Login request failed:",
                error
            );

            if (
                error instanceof TypeError &&
                error.message === "Failed to fetch"
            ) {
                setError(
                    "Unable to connect to the server. Please make sure the SkillBridge backend is running."
                );
            } else {
                setError(
                    error?.message ||
                    "Unable to login. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    const handleForgotPassword = () => {
        if (loading) return;

        setError("");

        if (onForgotPassword) {
            onForgotPassword();
        }
    };

    // =========================================================
    // REGISTER
    // =========================================================

    const handleRegister = () => {
        if (loading) return;

        setError("");

        if (onRegister) {
            onRegister();
        }
    };

    // =========================================================
    // TOGGLE PASSWORD
    // =========================================================

    const togglePasswordVisibility = () => {
        if (loading) return;

        setShowPassword(
            (previous) => !previous
        );
    };

    return (
        <div className="login-page">

            <form
                className="login-card"
                onSubmit={handleLogin}
                noValidate
            >

                {/* =================================================
                    TITLE
                ================================================= */}

                <h1 className="login-title">
                    SkillBridge
                </h1>

                <p className="login-subtitle">
                    Skill Exchange & Learning Platform
                </p>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        className="login-error"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </div>
                )}


                {/* =================================================
                    EMAIL
                ================================================= */}

                <div className="login-form-group">

                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        className="login-input"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);

                            if (error) {
                                setError("");
                            }
                        }}
                        required
                        autoComplete="email"
                        disabled={loading}
                    />

                </div>


                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div className="login-form-group">

                    <label htmlFor="password">
                        Password
                    </label>

                    <div className="login-password-wrapper">

                        <input
                            id="password"
                            className="login-input login-password-input"
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);

                                if (error) {
                                    setError("");
                                }
                            }}
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />

                        <button
                            type="button"
                            className="login-password-toggle"
                            onClick={togglePasswordVisibility}
                            disabled={loading}
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                            title={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showPassword
                                ? "🙈"
                                : "👁️"}
                        </button>

                    </div>

                </div>


                {/* =================================================
                    FORGOT PASSWORD
                ================================================= */}

                <div className="login-forgot">

                    <button
                        type="button"
                        className="login-forgot-button"
                        onClick={handleForgotPassword}
                        disabled={loading}
                    >
                        Forgot Password?
                    </button>

                </div>


                {/* =================================================
                    LOGIN BUTTON
                ================================================= */}

                <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>


                {/* =================================================
                    REGISTER LINK
                ================================================= */}

                <div className="login-register">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        className="login-register-button"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        Create Account
                    </button>

                </div>

            </form>

        </div>
    );
}

export default Login;