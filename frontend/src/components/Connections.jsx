import { useEffect, useState } from "react";

import "./Connections.css";


import API_URL from "../config";


function Connections({ onOpenChat }) {

    // =========================================================
    // STATE
    // =========================================================

    const [connections, setConnections] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // TOKEN
    // =========================================================

    const token =
        localStorage.getItem("token");


    // =========================================================
    // LOAD CONNECTIONS
    // =========================================================

    const loadConnections = async () => {

        try {

            setLoading(true);

            setError("");


            console.log(
                "===================================="
            );

            console.log(
                "LOADING MY CONNECTIONS"
            );

            console.log(
                "===================================="
            );


            const response =
                await fetch(
                    `${API_URL}/api/connections`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            console.log(
                "CONNECTIONS STATUS:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    `Failed to load connections (${response.status})`
                );

            }


            const data =
                await response.json();


            console.log(
                "===================================="
            );

            console.log(
                "MY CONNECTIONS API RESPONSE:"
            );

            console.log(
                data
            );

            console.log(
                "===================================="
            );


            if (Array.isArray(data)) {

                setConnections(data);

            } else {

                setConnections([]);

            }

        } catch (error) {

            console.error(
                "CONNECTIONS ERROR:",
                error
            );


            setError(
                error.message ||
                "Failed to load connections"
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // LOAD WHEN PAGE OPENS
    // =========================================================

    useEffect(() => {

        loadConnections();

    }, []);


    // =========================================================
    // OPEN CHAT
    // =========================================================

    const handleOpenChat = (connection) => {

        console.log(
            "===================================="
        );

        console.log(
            "OPENING CHAT"
        );

        console.log(
            "RAW CONNECTION OBJECT:"
        );

        console.log(
            connection
        );

        console.log(
            "===================================="
        );


        // =====================================================
        // IMPORTANT
        // =====================================================
        //
        // Backend may return:
        //
        // connectionId
        //
        // instead of:
        //
        // id
        //
        // So we support BOTH.
        // =====================================================

        const connectionId =
            connection?.connectionId ??
            connection?.id;


        console.log(
            "CONNECTION ID FROM API:",
            connectionId
        );


        // =====================================================
        // CONVERT TO NUMBER
        // =====================================================

        const numericConnectionId =
            Number(connectionId);


        console.log(
            "NUMERIC CONNECTION ID:",
            numericConnectionId
        );


        // =====================================================
        // VALIDATE CONNECTION ID
        // =====================================================

        if (
            !Number.isInteger(
                numericConnectionId
            ) ||
            numericConnectionId <= 0
        ) {

            console.error(
                "❌ INVALID CONNECTION ID"
            );

            console.error(
                "CONNECTION OBJECT:",
                connection
            );

            alert(
                "Unable to open chat: Invalid connection ID"
            );

            return;

        }


        // =====================================================
        // OTHER USER ID
        // =====================================================

        const otherUserId =
            connection?.userId ??
            connection?.otherUserId;


        console.log(
            "OTHER USER ID:",
            otherUserId
        );


        // =====================================================
        // CREATE OTHER USER OBJECT
        // =====================================================

        const otherUser = {

            id:
                otherUserId,

            userId:
                otherUserId,

            firstName:
                connection?.firstName ||
                "",

            lastName:
                connection?.lastName ||
                "",

            email:
                connection?.email ||
                ""

        };


        console.log(
            "===================================="
        );

        console.log(
            "OTHER USER:"
        );

        console.log(
            otherUser
        );

        console.log(
            "===================================="
        );


        // =====================================================
        // SEND DATA TO APP.JSX
        // =====================================================

        if (onOpenChat) {

            console.log(
                "SENDING CHAT DATA TO APP.JSX"
            );

            console.log(
                "CONNECTION ID:",
                numericConnectionId
            );

            console.log(
                "OTHER USER:",
                otherUser
            );


            onOpenChat(
                numericConnectionId,
                otherUser
            );

        } else {

            console.error(
                "❌ onOpenChat PROP IS NOT AVAILABLE"
            );

        }

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="connections-page">

                <div className="connections-loading">

                    <div className="connections-spinner" />

                    <p>
                        Loading connections...
                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <div className="connections-page">

                <div className="connections-error">

                    <h2>
                        My Connections
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={
                            loadConnections
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="connections-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="connections-header">

                <div>

                    <p className="connections-label">
                        SKILLBRIDGE
                    </p>

                    <h1>
                        My Connections
                    </h1>

                    <p>
                        Connect and chat with your
                        accepted skill exchange partners.
                    </p>

                </div>


                <div className="connections-header-icon">
                    🤝
                </div>

            </div>


            {/* =================================================
                CONNECTION COUNT
            ================================================= */}

            <div className="connections-count">

                <strong>
                    {connections.length}
                </strong>

                <span>

                    {connections.length === 1
                        ? " connection"
                        : " connections"}

                </span>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {connections.length === 0 ? (

                <div className="connections-empty">

                    <div className="connections-empty-icon">
                        🤝
                    </div>

                    <h2>
                        No connections yet
                    </h2>

                    <p>
                        Once you accept or receive a
                        connection, it will appear here.
                    </p>

                </div>

            ) : (

                /* =================================================
                   CONNECTION GRID
                ================================================= */

                <div className="connections-grid">

                    {connections.map(
                        (connection) => {


                            // =====================================
                            // CONNECTION ID
                            // =====================================

                            const connectionId =
                                connection?.connectionId ??
                                connection?.id;


                            // =====================================
                            // USER ID
                            // =====================================

                            const userId =
                                connection?.userId ??
                                connection?.otherUserId;


                            // =====================================
                            // USER NAME
                            // =====================================

                            const fullName = [

                                connection?.firstName,

                                connection?.lastName

                            ]
                                .filter(Boolean)
                                .join(" ")
                                ||
                                "User";


                            // =====================================
                            // INITIAL
                            // =====================================

                            const initial =
                                fullName
                                    .charAt(0)
                                    .toUpperCase();


                            return (

                                <div
                                    className="connection-card"
                                    key={
                                        connectionId ??
                                        userId ??
                                        Math.random()
                                    }
                                >


                                    {/* =================================
                                        USER
                                    ================================= */}

                                    <div className="connection-user">

                                        <div className="connection-avatar">

                                            {initial}

                                        </div>


                                        <div className="connection-user-info">

                                            <h3>
                                                {fullName}
                                            </h3>

                                            <p>
                                                {
                                                    connection?.email ||
                                                    "No email"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    {/* =================================
                                        STATUS
                                    ================================= */}

                                    <div className="connection-status">

                                        <span className="status-dot" />

                                        Connected

                                    </div>


                                    {/* =================================
                                        CHAT BUTTON
                                    ================================= */}

                                    <button
                                        type="button"
                                        className="open-chat-button"
                                        onClick={() =>
                                            handleOpenChat(
                                                connection
                                            )
                                        }
                                    >

                                        💬 Open Chat

                                    </button>


                                </div>

                            );

                        }
                    )}

                </div>

            )}

        </div>

    );

}


export default Connections;