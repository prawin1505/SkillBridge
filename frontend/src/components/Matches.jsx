import { useEffect, useState } from "react";
import "./Matches.css";

import API_URL from "../config";

function Matches() {
    const [matches, setMatches] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [connections, setConnections] = useState([]);

    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");

    const getHeaders = () => ({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    });

    // ==============================
    // LOAD MATCHES
    // ==============================

    const loadMatches = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/matches`,
                {
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to load matches (${response.status})`
                );
            }

            const data = await response.json();

            setMatches(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "MATCHES ERROR:",
                error
            );

            setError("Failed to load matches");
        }
    };

    // ==============================
    // LOAD SENT REQUESTS
    // ==============================

    const loadSentRequests = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/connections/sent`,
                {
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load sent requests"
                );
            }

            const data = await response.json();

            setSentRequests(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "SENT REQUESTS ERROR:",
                error
            );
        }
    };

    // ==============================
    // LOAD CONNECTIONS
    // ==============================

    const loadConnections = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/connections`,
                {
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load connections"
                );
            }

            const data = await response.json();

            setConnections(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "CONNECTIONS ERROR:",
                error
            );
        }
    };

    // ==============================
    // LOAD EVERYTHING
    // ==============================

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            await Promise.all([
                loadMatches(),
                loadSentRequests(),
                loadConnections()
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ==============================
    // SEND CONNECTION REQUEST
    // ==============================

    const sendConnectionRequest = async (userId) => {
        try {
            setSendingId(userId);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/api/connections`,
                {
                    method: "POST",
                    headers: getHeaders(),
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
                    `Request failed (${response.status})`
                );
            }

            setSuccess(
                "Connection request sent successfully!"
            );

            await loadSentRequests();

        } catch (error) {
            console.error(
                "SEND REQUEST ERROR:",
                error
            );

            setError(error.message);
        } finally {
            setSendingId(null);
        }
    };

    // ==============================
    // USER STATUS
    // ==============================

    const getUserStatus = (userId) => {
        const sentRequest = sentRequests.find(
            (request) =>
                request.receiverId === userId ||
                request.receiver?.id === userId
        );

        if (sentRequest) {
            if (sentRequest.status === "PENDING") {
                return "PENDING";
            }

            if (sentRequest.status === "ACCEPTED") {
                return "CONNECTED";
            }
        }

        const connected = connections.some(
            (connection) =>
                connection.userId === userId ||
                connection.id === userId
        );

        if (connected) {
            return "CONNECTED";
        }

        return "NONE";
    };

    // ==============================
    // FULL NAME
    // ==============================

    const getFullName = (match) => {
        const firstName = match.firstName || "";
        const lastName = match.lastName || "";

        return (
            `${firstName} ${lastName}`.trim() ||
            "SkillBridge User"
        );
    };

    // ==============================
    // INITIALS
    // ==============================

    const getInitials = (match) => {
        const first =
            match.firstName?.charAt(0) || "";

        const last =
            match.lastName?.charAt(0) || "";

        return (
            `${first}${last}`.toUpperCase() ||
            "U"
        );
    };

    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <div className="matches-page">

                <div className="matches-loading">

                    <div className="loading-spinner" />

                    <h3>
                        Finding your best matches...
                    </h3>

                    <p>
                        Please wait while we find
                        people compatible with your
                        skills.
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="matches-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="matches-header">

                <div>

                    <p className="matches-label">
                        SKILL MATCHING
                    </p>

                    <h1>
                        Discover Your Matches
                    </h1>

                    <p>
                        Connect with people whose
                        skills complement yours.
                    </p>

                </div>

                <button
                    type="button"
                    className="refresh-matches-button"
                    onClick={loadData}
                    disabled={loading}
                >
                    ↻ Refresh Matches
                </button>

            </div>


            {/* =========================
                MESSAGES
            ========================= */}

            {error && (
                <div className="matches-message error">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {success && (
                <div className="matches-message success">
                    <span>✓</span>
                    {success}
                </div>
            )}


            {/* =========================
                SUMMARY
            ========================= */}

            <div className="matches-summary">

                <div className="summary-card">

                    <div className="summary-icon">
                        🎯
                    </div>

                    <div>
                        <strong>
                            {matches.length}
                        </strong>

                        <span>
                            Compatible Matches
                        </span>
                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        📤
                    </div>

                    <div>
                        <strong>
                            {sentRequests.length}
                        </strong>

                        <span>
                            Requests Sent
                        </span>
                    </div>

                </div>


                <div className="summary-card">

                    <div className="summary-icon">
                        🤝
                    </div>

                    <div>
                        <strong>
                            {connections.length}
                        </strong>

                        <span>
                            Connections
                        </span>
                    </div>

                </div>

            </div>


            {/* =========================
                MATCHES
            ========================= */}

            {matches.length === 0 ? (

                <div className="matches-empty">

                    <div className="empty-icon">
                        🔍
                    </div>

                    <h2>
                        No Matches Found
                    </h2>

                    <p>
                        Add more teaching and learning
                        skills to discover people who
                        are compatible with you.
                    </p>

                </div>

            ) : (

                <div className="matches-grid">

                    {matches.map((match) => {

                        const status =
                            getUserStatus(
                                match.userId
                            );

                        return (
                            <div
                                className="match-profile-card"
                                key={match.userId}
                            >

                                {/* TOP */}

                                <div className="match-card-top">

                                    <div className="match-avatar">
                                        {getInitials(match)}
                                    </div>

                                    <div className="match-score">

                                        <strong>
                                            {match.matchScore}%
                                        </strong>

                                        <span>
                                            Match
                                        </span>

                                    </div>

                                </div>


                                {/* USER */}

                                <div className="match-user-info">

                                    <h2>
                                        {getFullName(match)}
                                    </h2>

                                    <p>
                                        {match.email}
                                    </p>

                                </div>


                                {/* SKILLS */}

                                <div className="match-skills-container">

                                    <div className="skill-column">

                                        <h4>
                                            💡 They Can Teach
                                        </h4>

                                        <div className="skill-tags">

                                            {match.theyCanTeach?.length > 0 ? (

                                                match.theyCanTeach.map(
                                                    (skill, index) => (
                                                        <span
                                                            className="teach-tag"
                                                            key={index}
                                                        >
                                                            {skill}
                                                        </span>
                                                    )
                                                )

                                            ) : (

                                                <span className="no-skill">
                                                    No skills listed
                                                </span>

                                            )}

                                        </div>

                                    </div>


                                    <div className="skill-column">

                                        <h4>
                                            📚 They Want to Learn
                                        </h4>

                                        <div className="skill-tags">

                                            {match.theyCanLearn?.length > 0 ? (

                                                match.theyCanLearn.map(
                                                    (skill, index) => (
                                                        <span
                                                            className="learn-tag"
                                                            key={index}
                                                        >
                                                            {skill}
                                                        </span>
                                                    )
                                                )

                                            ) : (

                                                <span className="no-skill">
                                                    No skills listed
                                                </span>

                                            )}

                                        </div>

                                    </div>

                                </div>


                                {/* CONNECTION */}

                                <div className="match-card-footer">

                                    {status === "PENDING" ? (

                                        <button
                                            type="button"
                                            className="connection-button pending"
                                            disabled
                                        >
                                            ⏳ Request Sent
                                        </button>

                                    ) : status === "CONNECTED" ? (

                                        <button
                                            type="button"
                                            className="connection-button connected"
                                            disabled
                                        >
                                            ✓ Connected
                                        </button>

                                    ) : (

                                        <button
                                            type="button"
                                            className="connection-button"
                                            onClick={() =>
                                                sendConnectionRequest(
                                                    match.userId
                                                )
                                            }
                                            disabled={
                                                sendingId ===
                                                match.userId
                                            }
                                        >
                                            {sendingId ===
                                            match.userId
                                                ? "Sending..."
                                                : "🤝 Connect"}
                                        </button>

                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>

            )}

        </div>
    );
}

export default Matches;