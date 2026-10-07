import { useState } from "react";
import "./Register.css";

import API_URL from "../config";

function Register({ onRegister, onBackToLogin }) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================
    // HANDLE INPUT
    // ==========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    };

    // ==========================
    // VALIDATE FORM
    // ==========================

    const validateForm = () => {
        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const email = form.email.trim();
        const password = form.password;

        if (!firstName) {
            return "Please enter your first name.";
        }

        if (!lastName) {
            return "Please enter your last name.";
        }

        if (!email) {
            return "Please enter your email.";
        }

        if (!email.includes("@")) {
            return "Please enter a valid email address.";
        }

        if (!password) {
            return "Please create a password.";
        }

        if (password.length < 6) {
            return "Password must contain at least 6 characters.";
        }

        return "";
    };

    // ==========================
    // REGISTER
    // ==========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const registrationData = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            password: form.password,
        };

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(registrationData),
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                let message = "Registration failed. Please try again.";

                if (response.status === 400) {
                    message =
                        data?.message ||
                        "Please check the information you entered.";
                } else if (response.status === 409) {
                    message =
                        data?.message ||
                        "This email is already registered.";
                } else if (response.status === 500) {
                    message =
                        "Server error. Please try again later.";
                } else if (data?.message) {
                    message = data.message;
                }

                throw new Error(message);
            }

            // ==========================
            // SUCCESS
            // ==========================

            setSuccess(
                "Account created successfully! You can now login."
            );

            setForm({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
            });

            setShowPassword(false);

        } catch (error) {
            console.error("Registration request failed:", error);

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
                    "Unable to create your account. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // ==========================
    // BACK TO LOGIN
    // ==========================

    const handleBackToLogin = () => {
        if (loading) {
            return;
        }

        setError("");
        setSuccess("");

        if (onBackToLogin) {
            onBackToLogin();
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                <h1>SkillBridge</h1>

                <h2>Create Account</h2>

                <p className="register-subtitle">
                    Join SkillBridge and exchange your skills
                </p>


                {/* ==========================
                    ERROR
                ========================== */}

                {error && (
                    <div
                        className="register-error"
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </div>
                )}


                {/* ==========================
                    SUCCESS
                ========================== */}

                {success && (
                    <div
                        className="register-success"
                        role="status"
                        aria-live="polite"
                    >
                        {success}
                    </div>
                )}


                <form onSubmit={handleSubmit} noValidate>

                    {/* ==========================
                        NAME
                    ========================== */}

                    <div className="name-row">

                        <div className="form-group">

                            <label htmlFor="firstName">
                                First Name
                            </label>

                            <input
                                id="firstName"
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder="First name"
                                autoComplete="given-name"
                                required
                                disabled={loading}
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="lastName">
                                Last Name
                            </label>

                            <input
                                id="lastName"
                                type="text"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder="Last name"
                                autoComplete="family-name"
                                required
                                disabled={loading}
                            />

                        </div>

                    </div>


                    {/* ==========================
                        EMAIL
                    ========================== */}

                    <div className="form-group">

                        <label htmlFor="register-email">
                            Email
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                            disabled={loading}
                        />

                    </div>


                    {/* ==========================
                        PASSWORD
                    ========================== */}

                    <div className="form-group">

                        <label htmlFor="register-password">
                            Password
                        </label>

                        <div className="password-wrapper">

                            <input
                                id="register-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="show-password-button"
                                onClick={() =>
                                    setShowPassword(
                                        (previous) => !previous
                                    )
                                }
                                disabled={loading}
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                    </div>


                    {/* ==========================
                        REGISTER BUTTON
                    ========================== */}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>


                {/* ==========================
                    LOGIN
                ========================== */}

                <div className="login-link">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={handleBackToLogin}
                        disabled={loading}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Register;