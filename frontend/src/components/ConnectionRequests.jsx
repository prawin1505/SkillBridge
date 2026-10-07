import { useEffect, useState } from "react";
import "./ConnectionRequests.css";

import API_URL from "../config";;

function ConnectionRequests() {
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
    });

    // ==============================
    // LOAD REQUESTS
    // ==============================

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                receivedResponse,
                sentResponse
            ] = await Promise.all([
                fetch(
                    `${API_URL}/api/connections/received`,
                    {
                        headers: getHeaders()
                    }
                ),
                fetch(
                    `${API_URL}/api/connections/sent`,
                    {
                        headers: getHeaders()
                    }
                )
            ]);

            if (!receivedResponse.ok) {
                throw new Error(
                    `Received requests: HTTP ${receivedResponse.status}`
                );
            }

            if (!sentResponse.ok) {
                throw new Error(
                    `Sent requests: HTTP ${sentResponse.status}`
                );
            }

            const receivedData =
                await receivedResponse.json();

            const sentData =
                await sentResponse.json();

            setReceived(
                Array.isArray(receivedData)
                    ? receivedData
                    : []
            );

            setSent(
                Array.isArray(sentData)
                    ? sentData
                    : []
            );

        } catch (error) {
            console.error(
                "REQUEST LOADING ERROR:",
                error
            );

            setError(
                "Failed to load connection requests"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // ==============================
    // ACCEPT REQUEST
    // ==============================

    const acceptRequest = async (connectionId) => {
        try {
            const response = await fetch(
                `${API_URL}/api/connections/${connectionId}/accept`,
                {
                    method: "POST",
                    headers: getHeaders()
                }
            );

            const data =
                await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    `HTTP ${response.status}`
                );
            }

            setReceived(previous =>
                previous.filter(
                    request =>
                        request.id !== connectionId
                )
            );

            await loadRequests();

        } catch (error) {
            console.error(
                "ACCEPT ERROR:",
                error
            );

            alert(
                error.message ||
                "Failed to accept connection request"
            );
        }
    };

    // ==============================
    // REJECT REQUEST
    // ==============================

    const rejectRequest = async (connectionId) => {
        try {
            const response = await fetch(
                `${API_URL}/api/connections/${connectionId}/reject`,
                {
                    method: "POST",
                    headers: getHeaders()
                }
            );

            const data =
                await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    `HTTP ${response.status}`
                );
            }

            setReceived(previous =>
                previous.filter(
                    request =>
                        request.id !== connectionId
                )
            );

            await loadRequests();

        } catch (error) {
            console.error(
                "REJECT ERROR:",
                error
            );

            alert(
                error.message ||
                "Failed to reject connection request"
            );
        }
    };

    // ==============================
    // GET INITIAL
    // ==============================

    const getInitial = (name) => {
        if (!name) return "?";

        return name
            .trim()
            .charAt(0)
            .toUpperCase();
    };

    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <div className="connection-requests-page">
                <div className="requests-loading">
                    <div className="requests-spinner" />
                    <p>Loading connection requests...</p>
                </div>
            </div>
        );
    }

    // ==============================
    // ERROR
    // ==============================

    if (error) {
        return (
            <div className="connection-requests-page">
                <div className="requests-error">
                    <div className="requests-error-icon">
                        ⚠️
                    </div>

                    <h2>Connection Requests</h2>

                    <p>{error}</p>

                    <button onClick={loadRequests}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ==============================
    // PAGE
    // ==============================

    return (
        <div className="connection-requests-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="requests-header">

                <div>
                    <p className="requests-label">
                        SKILLBRIDGE
                    </p>

                    <h1>
                        Connection Requests
                    </h1>

                    <p>
                        Manage the people who want to
                        connect with you.
                    </p>
                </div>

                <div className="requests-header-icon">
                    🤝
                </div>

            </div>


            {/* =========================
                SUMMARY
            ========================= */}

            <div className="requests-summary">

                <div className="summary-card">
                    <span className="summary-icon received">
                        📥
                    </span>

                    <div>
                        <strong>
                            {received.length}
                        </strong>

                        <p>
                            Received
                        </p>
                    </div>
                </div>

                <div className="summary-card">
                    <span className="summary-icon sent">
                        📤
                    </span>

                    <div>
                        <strong>
                            {sent.length}
                        </strong>

                        <p>
                            Sent
                        </p>
                    </div>
                </div>

            </div>


            {/* =========================
                RECEIVED REQUESTS
            ========================= */}

            <section className="requests-section">

                <div className="section-heading">
                    <div>
                        <h2>
                            Received Requests
                        </h2>

                        <p>
                            People who want to connect
                            with you.
                        </p>
                    </div>

                    <span className="section-count">
                        {received.length}
                    </span>
                </div>


                {received.length === 0 ? (

                    <div className="requests-empty">
                        <div className="empty-icon">
                            📥
                        </div>

                        <h3>
                            No connection requests
                        </h3>

                        <p>
                            You don't have any incoming
                            connection requests right now.
                        </p>
                    </div>

                ) : (

                    <div className="request-list">

                        {received.map((request) => {

                            const name =
                                request.senderName ||
                                "Unknown User";

                            return (
                                <div
                                    className="request-card"
                                    key={request.id}
                                >

                                    <div className="request-user">

                                        <div className="request-avatar">
                                            {getInitial(name)}
                                        </div>

                                        <div className="request-user-info">

                                            <h3>
                                                {name}
                                            </h3>

                                            <p>
                                                Sent you a
                                                connection request
                                            </p>

                                            <span className="request-status pending">
                                                {request.status}
                                            </span>

                                        </div>

                                    </div>


                                    {request.status === "PENDING" && (

                                        <div className="request-actions">

                                            <button
                                                type="button"
                                                className="accept-button"
                                                onClick={() =>
                                                    acceptRequest(
                                                        request.id
                                                    )
                                                }
                                            >
                                                ✓ Accept
                                            </button>

                                            <button
                                                type="button"
                                                className="reject-button"
                                                onClick={() =>
                                                    rejectRequest(
                                                        request.id
                                                    )
                                                }
                                            >
                                                ✕ Reject
                                            </button>

                                        </div>

                                    )}


                                    {request.status === "ACCEPTED" && (

                                        <span className="request-status accepted">
                                            ✓ Connected
                                        </span>

                                    )}


                                    {request.status === "REJECTED" && (

                                        <span className="request-status rejected">
                                            Rejected
                                        </span>

                                    )}

                                </div>
                            );
                        })}

                    </div>
                )}

            </section>


            {/* =========================
                SENT REQUESTS
            ========================= */}

            <section className="requests-section sent-section">

                <div className="section-heading">
                    <div>
                        <h2>
                            Sent Requests
                        </h2>

                        <p>
                            Connection requests you have
                            sent to other users.
                        </p>
                    </div>

                    <span className="section-count">
                        {sent.length}
                    </span>
                </div>


                {sent.length === 0 ? (

                    <div className="requests-empty">
                        <div className="empty-icon">
                            📤
                        </div>

                        <h3>
                            No sent requests
                        </h3>

                        <p>
                            You haven't sent any connection
                            requests yet.
                        </p>
                    </div>

                ) : (

                    <div className="request-list">

                        {sent.map((request) => {

                            const name =
                                request.receiverName ||
                                "Unknown User";

                            return (
                                <div
                                    className="request-card"
                                    key={request.id}
                                >

                                    <div className="request-user">

                                        <div className="request-avatar">
                                            {getInitial(name)}
                                        </div>

                                        <div className="request-user-info">

                                            <h3>
                                                {name}
                                            </h3>

                                            <p>
                                                Connection request
                                                sent
                                            </p>

                                        </div>

                                    </div>


                                    <div className="sent-status">

                                        {request.status === "ACCEPTED" && (
                                            <span className="request-status accepted">
                                                ✓ Accepted
                                            </span>
                                        )}

                                        {request.status === "PENDING" && (
                                            <span className="request-status pending">
                                                Pending
                                            </span>
                                        )}

                                        {request.status === "REJECTED" && (
                                            <span className="request-status rejected">
                                                Rejected
                                            </span>
                                        )}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </section>

        </div>
    );
}

export default ConnectionRequests;