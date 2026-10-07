import { useEffect, useRef, useState } from "react";

import {
    connectWebSocket,
    subscribeToChat,
    disconnectWebSocket
} from "../services/websocket";

import {
    getCurrentUser,
    getMessages,
    sendMessage as sendMessageAPI,
    markMessagesAsRead
} from "../services/api";

import "./Chat.css";


function Chat({
    connectionId,
    otherUser,
    onBack
}) {

    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [status, setStatus] = useState("connecting");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const subscriptionRef = useRef(null);

    const numericConnectionId = Number(connectionId);

    const otherUserName =
        otherUser
            ? `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim()
            : "User";

    const avatarLetter =
        otherUser?.firstName
            ? otherUser.firstName.charAt(0).toUpperCase()
            : "U";


    // =====================================================
    // LOAD USER + MESSAGES
    // =====================================================

    useEffect(() => {

        let mounted = true;

        const loadChat = async () => {

            if (
                !Number.isInteger(numericConnectionId) ||
                numericConnectionId <= 0
            ) {
                setError("Invalid connection ID");
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError("");

                const user = await getCurrentUser();

                if (!mounted) return;

                setCurrentUser(user);

                const oldMessages =
                    await getMessages(numericConnectionId);

                if (!mounted) return;

                setMessages(
                    Array.isArray(oldMessages)
                        ? oldMessages
                        : []
                );

                try {
                    await markMessagesAsRead(
                        numericConnectionId
                    );
                } catch (readError) {
                    console.warn(
                        "MARK READ ERROR:",
                        readError
                    );
                }

            } catch (err) {

                console.error(
                    "CHAT LOAD ERROR:",
                    err
                );

                if (mounted) {
                    setError(
                        err.message ||
                        "Failed to load chat"
                    );
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };

        loadChat();

        return () => {
            mounted = false;
        };

    }, [connectionId]);


    // =====================================================
    // WEBSOCKET
    // =====================================================

    useEffect(() => {

        if (!currentUser) return;

        if (
            !Number.isInteger(numericConnectionId) ||
            numericConnectionId <= 0
        ) {
            return;
        }

        let mounted = true;

        connectWebSocket(

            // CONNECTED
            () => {

                if (!mounted) return;

                console.log(
                    "CHAT WEBSOCKET CONNECTED"
                );

                setStatus("connected");

                const subscription =
                    subscribeToChat(
                        numericConnectionId,
                        (newMessage) => {

                            if (!mounted) return;

                            if (!newMessage) return;

                            if (
                                newMessage.connectionId &&
                                Number(
                                    newMessage.connectionId
                                ) !== numericConnectionId
                            ) {
                                return;
                            }

                            setMessages(previous => {

                                if (
                                    newMessage.id &&
                                    previous.some(
                                        message =>
                                            Number(message.id) ===
                                            Number(newMessage.id)
                                    )
                                ) {
                                    return previous;
                                }

                                return [
                                    ...previous,
                                    newMessage
                                ];

                            });

                        }
                    );

                subscriptionRef.current =
                    subscription;

            },

            // DISCONNECTED
            () => {

                if (!mounted) return;

                setStatus("disconnected");

            },

            // ERROR
            (webSocketError) => {

                if (!mounted) return;

                console.error(
                    "WEBSOCKET ERROR:",
                    webSocketError
                );

                setStatus("disconnected");

            }

        );


        return () => {

            mounted = false;

            if (subscriptionRef.current) {

                try {
                    subscriptionRef.current.unsubscribe();
                } catch (error) {
                    console.warn(
                        "SUBSCRIPTION CLEANUP ERROR:",
                        error
                    );
                }

                subscriptionRef.current = null;
            }

            disconnectWebSocket();

        };

    }, [currentUser, connectionId]);


    // =====================================================
    // AUTO SCROLL
    // =====================================================

    useEffect(() => {

        setTimeout(() => {

            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });

        }, 100);

    }, [messages]);


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const handleSend = async () => {

        const content =
            messageText.trim();

        if (!content) return;

        if (!currentUser) return;

        if (
            !Number.isInteger(numericConnectionId) ||
            numericConnectionId <= 0
        ) {
            setError("Invalid connection ID");
            return;
        }

        if (sending) return;

        try {

            setSending(true);
            setError("");

            const savedMessage =
                await sendMessageAPI(
                    numericConnectionId,
                    content
                );

            if (!savedMessage) {
                throw new Error(
                    "Message was not saved"
                );
            }

            setMessages(previous => {

                if (
                    savedMessage.id &&
                    previous.some(
                        message =>
                            Number(message.id) ===
                            Number(savedMessage.id)
                    )
                ) {
                    return previous;
                }

                return [
                    ...previous,
                    savedMessage
                ];

            });

            setMessageText("");

            setTimeout(() => {
                textareaRef.current?.focus();
            }, 50);

        } catch (err) {

            console.error(
                "SEND MESSAGE ERROR:",
                err
            );

            setError(
                err.message ||
                "Failed to send message"
            );

        } finally {

            setSending(false);

        }

    };


    // =====================================================
    // ENTER KEY
    // =====================================================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();

        }

    };


    // =====================================================
    // FORMAT TIME
    // =====================================================

    const formatTime = (value) => {

        if (!value) return "";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =====================================================
    // CURRENT USER ID
    // =====================================================

    const currentUserId =
        Number(
            currentUser?.id ??
            currentUser?.userId
        );


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="chat-page">

                <div className="chat-loading">

                    <div className="chat-loading-spinner" />

                    <p>
                        Loading conversation...
                    </p>

                </div>

            </div>
        );

    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="chat-page">

            <div className="chat-container">


                {/* =========================================
                    HEADER
                ========================================= */}

                <header className="chat-header">

                    <div className="chat-user-section">

                        <div className="chat-user-avatar">

                            {avatarLetter}

                        </div>


                        <div className="chat-user-details">

                            <h2>
                                {otherUserName}
                            </h2>

                            <span>
                                SkillBridge Chat
                            </span>

                        </div>

                    </div>


                    <div
                        className={`chat-connection-status ${
                            status === "connected"
                                ? "connected"
                                : status === "disconnected"
                                    ? "disconnected"
                                    : "connecting"
                        }`}
                    >

                        <span className="status-indicator" />

                        {status === "connected"
                            ? "Connected"
                            : status === "disconnected"
                                ? "Disconnected"
                                : "Connecting..."}

                    </div>

                </header>


                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div className="chat-error">

                        {error}

                    </div>

                )}


                {/* =========================================
                    MESSAGES
                ========================================= */}

                <main className="chat-messages">

                    {messages.length === 0 ? (

                        <div className="empty-chat">

                            <div className="empty-chat-icon">
                                💬
                            </div>

                            <h3>
                                Start the conversation
                            </h3>

                            <p>
                                Send a message to{" "}
                                {otherUserName}
                            </p>

                        </div>

                    ) : (

                        messages.map(
                            (message, index) => {

                                const senderId =
                                    Number(
                                        message.senderId
                                    );

                                const isMine =
                                    senderId ===
                                    currentUserId;


                                return (

                                    <div
                                        key={
                                            message.id ||
                                            `message-${index}`
                                        }
                                        className={`message-row ${
                                            isMine
                                                ? "sent"
                                                : "received"
                                        }`}
                                    >

                                        <div
                                            className={`message-bubble ${
                                                isMine
                                                    ? "sent-bubble"
                                                    : "received-bubble"
                                            }`}
                                        >

                                            <div className="message-text">

                                                {message.content}

                                            </div>

                                            <div className="message-time">

                                                {formatTime(
                                                    message.sentAt
                                                )}

                                                {isMine && (

                                                    <span className="read-status">

                                                        {message.read
                                                            ? " ✓✓"
                                                            : " ✓"}

                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )

                    )}

                    <div ref={messagesEndRef} />

                </main>


                {/* =========================================
                    INPUT
                ========================================= */}

                <footer className="chat-input-area">

                    <textarea
                        ref={textareaRef}
                        value={messageText}
                        onChange={(event) =>
                            setMessageText(
                                event.target.value
                            )
                        }
                        onKeyDown={handleKeyDown}
                        placeholder={
                            status === "connected"
                                ? `Message ${otherUserName}...`
                                : "Connecting..."
                        }
                        disabled={
                            sending ||
                            status !== "connected"
                        }
                        rows={1}
                    />


                    <button
                        className="send-button"
                        onClick={handleSend}
                        disabled={
                            sending ||
                            status !== "connected" ||
                            !messageText.trim()
                        }
                    >

                        {sending
                            ? "..."
                            : "➤"}

                    </button>

                </footer>

            </div>

        </div>

    );

}


export default Chat;