import { useEffect, useState } from "react";
import "./DiscoverUsers.css";

import API_URL from "../config";

function DiscoverUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sendingId, setSendingId] = useState(null);
    const [success, setSuccess] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [reportLoading, setReportLoading] = useState(false);

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // ==============================
    // LOAD USERS
    // ==============================

    const loadUsers = async () => {
        const token = getToken();

        if (!token) {
            setError("Please login again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const url = search.trim()
                ? `${API_URL}/api/users/discover?search=${encodeURIComponent(search)}`
                : `${API_URL}/api/users/discover`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to load users");
            }

            const data = await response.json();

            setUsers(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(
                "Discover users error:",
                err
            );

            setError("Unable to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // ==============================
    // SEARCH
    // ==============================

    const handleSearch = (e) => {
        e.preventDefault();
        loadUsers();
    };

    // ==============================
    // VIEW PROFILE
    // ==============================

    const viewProfile = async (userId) => {
        const token = getToken();

        if (!token) {
            setError("Please login again.");
            return;
        }

        try {
            setProfileLoading(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/api/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(
                        "User profile not found."
                    );
                }

                throw new Error(
                    "Unable to load user profile."
                );
            }

            const data = await response.json();

            setSelectedUser(data);
        } catch (err) {
            console.error(
                "Profile loading error:",
                err
            );

            setError(err.message);
        } finally {
            setProfileLoading(false);
        }
    };

    // ==============================
    // CLOSE PROFILE
    // ==============================

    const closeProfile = () => {
        setSelectedUser(null);
        setShowReportModal(false);
        setReportReason("");
        setReportDescription("");
        setError("");
        setSuccess("");
    };

    // ==============================
    // SEND CONNECTION REQUEST
    // ==============================

    const sendConnectionRequest = async (userId) => {
        const token = getToken();

        if (!token) {
            setError("Please login again.");
            return;
        }

        try {
            setSendingId(userId);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/api/connections`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        receiverId: userId
                    })
                }
            );

            const data = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Failed to send connection request"
                );
            }

            setSuccess(
                "Connection request sent successfully."
            );
        } catch (err) {
            console.error(
                "Connection request error:",
                err
            );

            setError(err.message);
        } finally {
            setSendingId(null);
        }
    };

    // ==============================
    // REPORT MODAL
    // ==============================

    const openReportModal = () => {
        setShowReportModal(true);
        setReportReason("");
        setReportDescription("");
        setError("");
        setSuccess("");
    };

    const closeReportModal = () => {
        if (reportLoading) {
            return;
        }

        setShowReportModal(false);
        setReportReason("");
        setReportDescription("");
        setError("");
    };

    // ==============================
    // SUBMIT REPORT
    // ==============================

    const submitReport = async () => {
        const token = getToken();

        if (!token) {
            setError("Please login again.");
            return;
        }

        if (!selectedUser) {
            setError("User profile not found.");
            return;
        }

        if (!reportReason) {
            setError("Please select a reason.");
            return;
        }

        try {
            setReportLoading(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/api/reports`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reportedUserId: selectedUser.id,
                        reason: reportReason,
                        description:
                            reportDescription.trim()
                    })
                }
            );

            const data = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Failed to submit report."
                );
            }

            setShowReportModal(false);
            setReportReason("");
            setReportDescription("");

            setSuccess(
                "Report submitted successfully. Thank you for helping keep SkillBridge safe."
            );
        } catch (err) {
            console.error(
                "Report error:",
                err
            );

            setError(err.message);
        } finally {
            setReportLoading(false);
        }
    };

    // ==============================
    // INITIALS
    // ==============================

    const getInitials = (user) => {
        const first =
            user?.firstName?.charAt(0) || "";

        const last =
            user?.lastName?.charAt(0) || "";

        return (
            `${first}${last}`.toUpperCase() || "U"
        );
    };

    // ==============================
    // OTHER USER PROFILE
    // ==============================

    if (selectedUser) {
        return (
            <div className="discover-users-page">

                <div className="user-profile-container">

                    <button
                        type="button"
                        className="profile-back-button"
                        onClick={closeProfile}
                    >
                        ← Back to Discover Users
                    </button>

                    <div className="other-user-profile">

                        <div className="other-user-avatar">
                            {getInitials(selectedUser)}
                        </div>

                        <h1>
                            {selectedUser.firstName}{" "}
                            {selectedUser.lastName}
                        </h1>

                        <p className="other-user-email">
                            📧 {selectedUser.email}
                        </p>

                        <div className="other-user-role">
                            {selectedUser.role || "USER"}
                        </div>

                        {/* ABOUT */}

                        <div className="profile-section">

                            <h2>About</h2>

                            {selectedUser.bio ? (
                                <p>
                                    {selectedUser.bio}
                                </p>
                            ) : (
                                <p className="empty-profile-text">
                                    This user has not added
                                    a bio yet.
                                </p>
                            )}

                        </div>

                        {/* TEACH SKILLS */}

                        <div className="profile-section">

                            <h2>
                                🎓 Skills I Can Teach
                            </h2>

                            {selectedUser.skillsToTeach &&
                            selectedUser.skillsToTeach.length > 0 ? (
                                <div className="profile-skills">

                                    {selectedUser.skillsToTeach.map(
                                        (skill, index) => (
                                            <span
                                                className="profile-skill teach"
                                                key={index}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )}

                                </div>
                            ) : (
                                <p className="empty-profile-text">
                                    No teaching skills
                                    added yet.
                                </p>
                            )}

                        </div>

                        {/* LEARN SKILLS */}

                        <div className="profile-section">

                            <h2>
                                📚 Skills I Want to Learn
                            </h2>

                            {selectedUser.skillsToLearn &&
                            selectedUser.skillsToLearn.length > 0 ? (
                                <div className="profile-skills">

                                    {selectedUser.skillsToLearn.map(
                                        (skill, index) => (
                                            <span
                                                className="profile-skill learn"
                                                key={index}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )}

                                </div>
                            ) : (
                                <p className="empty-profile-text">
                                    No learning skills
                                    added yet.
                                </p>
                            )}

                        </div>

                        {/* ACTIONS */}

                        <div className="profile-actions">

                            <button
                                type="button"
                                className="profile-connect-button"
                                disabled={
                                    sendingId ===
                                    selectedUser.id
                                }
                                onClick={() =>
                                    sendConnectionRequest(
                                        selectedUser.id
                                    )
                                }
                            >
                                {sendingId ===
                                selectedUser.id
                                    ? "Sending..."
                                    : "🤝 Connect"}
                            </button>

                            <button
                                type="button"
                                className="profile-report-button"
                                onClick={openReportModal}
                            >
                                🚩 Report User
                            </button>

                        </div>

                        {error && (
                            <div className="discover-message error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="discover-message success">
                                {success}
                            </div>
                        )}

                    </div>
                </div>

                {/* REPORT MODAL */}

                {showReportModal && (
                    <div
                        className="report-modal-overlay"
                        onClick={(e) => {
                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                closeReportModal();
                            }
                        }}
                    >

                        <div className="report-modal">

                            <div className="report-modal-header">

                                <div>
                                    <div className="report-modal-icon">
                                        🚩
                                    </div>

                                    <h2>
                                        Report User
                                    </h2>

                                    <p>
                                        Report{" "}
                                        {selectedUser.firstName}{" "}
                                        {selectedUser.lastName}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="report-close-button"
                                    onClick={closeReportModal}
                                    disabled={reportLoading}
                                    aria-label="Close report dialog"
                                >
                                    ×
                                </button>

                            </div>

                            <div className="report-form">

                                <label htmlFor="report-reason">
                                    Reason
                                </label>

                                <select
                                    id="report-reason"
                                    value={reportReason}
                                    onChange={(e) =>
                                        setReportReason(
                                            e.target.value
                                        )
                                    }
                                    disabled={reportLoading}
                                >
                                    <option value="">
                                        Select a reason
                                    </option>

                                    <option value="SPAM">
                                        Spam
                                    </option>

                                    <option value="HARASSMENT">
                                        Harassment
                                    </option>

                                    <option value="FAKE_PROFILE">
                                        Fake Profile
                                    </option>

                                    <option value="INAPPROPRIATE_CONTENT">
                                        Inappropriate Content
                                    </option>

                                    <option value="OTHER">
                                        Other
                                    </option>
                                </select>

                                <label htmlFor="report-description">
                                    Description
                                </label>

                                <textarea
                                    id="report-description"
                                    value={reportDescription}
                                    onChange={(e) =>
                                        setReportDescription(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describe the issue..."
                                    maxLength={500}
                                    rows={5}
                                    disabled={reportLoading}
                                />

                                <div className="report-character-count">
                                    {reportDescription.length}/500
                                </div>

                                <div className="report-modal-actions">

                                    <button
                                        type="button"
                                        className="report-cancel-button"
                                        onClick={
                                            closeReportModal
                                        }
                                        disabled={
                                            reportLoading
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="report-submit-button"
                                        onClick={
                                            submitReport
                                        }
                                        disabled={
                                            reportLoading ||
                                            !reportReason
                                        }
                                    >
                                        {reportLoading
                                            ? "Submitting..."
                                            : "Submit Report"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

            </div>
        );
    }

    // ==============================
    // MAIN PAGE
    // ==============================

    return (
        <div className="discover-users-page">

            {/* HEADER */}

            <div className="discover-header">

                <div>
                    <p className="discover-label">
                        SKILLBRIDGE COMMUNITY
                    </p>

                    <h1>
                        Discover Users
                    </h1>

                    <p>
                        Find people on SkillBridge
                        and connect with potential
                        skill exchange partners.
                    </p>
                </div>

                <div className="discover-icon">
                    👥
                </div>

            </div>

            {/* SEARCH */}

            <form
                className="discover-search"
                onSubmit={handleSearch}
            >
                <div className="search-input-wrapper">

                    <span className="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    {search && (
                        <button
                            type="button"
                            className="clear-search"
                            onClick={() => {
                                setSearch("");
                            }}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}

                </div>

                <button
                    type="submit"
                    className="discover-search-button"
                >
                    Search
                </button>
            </form>

            {/* MESSAGES */}

            {error && (
                <div className="discover-message error">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {success && (
                <div className="discover-message success">
                    <span>✓</span>
                    {success}
                </div>
            )}

            {/* LOADING */}

            {loading ? (
                <div className="discover-loading">

                    <div className="discover-spinner" />

                    <h3>
                        Finding SkillBridge users...
                    </h3>

                    <p>
                        Please wait.
                    </p>

                </div>
            ) : users.length === 0 ? (

                /* EMPTY */

                <div className="discover-empty">

                    <div className="empty-search-icon">
                        🔍
                    </div>

                    <h3>
                        No users found
                    </h3>

                    <p>
                        Try searching with another
                        name or email.
                    </p>

                </div>

            ) : (

                /* USER GRID */

                <div className="discover-grid">

                    {users.map((user) => (

                        <div
                            className="discover-card"
                            key={user.id}
                        >

                            <div className="discover-card-top">

                                <div className="discover-avatar">
                                    {getInitials(user)}
                                </div>

                                <div className="discover-user-info">

                                    <h3>
                                        {user.firstName}{" "}
                                        {user.lastName}
                                    </h3>

                                    <p>
                                        {user.email}
                                    </p>

                                </div>

                            </div>

                            <div className="discover-card-footer">

                                <button
                                    type="button"
                                    className="view-profile-button"
                                    disabled={profileLoading}
                                    onClick={() =>
                                        viewProfile(
                                            user.id
                                        )
                                    }
                                >
                                    {profileLoading
                                        ? "Loading..."
                                        : "👤 View Profile"}
                                </button>

                                <button
                                    type="button"
                                    className="connect-user-button"
                                    disabled={
                                        sendingId ===
                                        user.id
                                    }
                                    onClick={() =>
                                        sendConnectionRequest(
                                            user.id
                                        )
                                    }
                                >
                                    {sendingId ===
                                    user.id
                                        ? "Sending..."
                                        : "🤝 Connect"}
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default DiscoverUsers;