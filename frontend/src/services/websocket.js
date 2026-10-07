import { Client } from "@stomp/stompjs";
import API_URL from "../config";


// =========================================================
// WEBSOCKET CONFIGURATION
// =========================================================

const WS_URL = `${API_URL}/ws`;

let stompClient = null;
let connected = false;


// =========================================================
// CONNECT WEBSOCKET
// =========================================================

export function connectWebSocket(
    onConnected,
    onDisconnected,
    onError
) {

    console.log(
        "===================================="
    );

    console.log(
        "STARTING WEBSOCKET CONNECTION"
    );

    console.log(
        "URL:",
        WS_URL
    );

    console.log(
        "===================================="
    );


    // =====================================================
    // GET JWT TOKEN
    // =====================================================

    const token =
        localStorage.getItem("token");


    console.log(
        "JWT TOKEN:",
        token
            ? "TOKEN FOUND"
            : "TOKEN NOT FOUND"
    );


    // =====================================================
    // TOKEN VALIDATION
    // =====================================================

    if (!token) {

        const error =
            new Error(
                "JWT token not found"
            );


        console.error(
            "WEBSOCKET ERROR:",
            error.message
        );


        if (onError) {
            onError(error);
        }


        return null;

    }


    // =====================================================
    // CLOSE PREVIOUS CLIENT
    // =====================================================

    if (stompClient) {

        console.log(
            "DEACTIVATING PREVIOUS STOMP CLIENT"
        );


        try {

            stompClient.deactivate();

        } catch (error) {

            console.error(
                "OLD CLIENT DEACTIVATE ERROR:",
                error
            );

        }


        stompClient = null;

    }


    connected = false;


    // =====================================================
    // CREATE STOMP CLIENT
    // =====================================================

    stompClient = new Client({

        brokerURL: WS_URL,


        // -------------------------------------------------
        // IMPORTANT
        // -------------------------------------------------

        reconnectDelay: 5000,


        // -------------------------------------------------
        // JWT AUTHENTICATION
        // -------------------------------------------------

        connectHeaders: {

            Authorization:
                `Bearer ${token}`

        },


        // -------------------------------------------------
        // DEBUG
        // -------------------------------------------------

        debug: (message) => {

            console.log(
                "[STOMP]",
                message
            );

        },


        // =================================================
        // CONNECTED
        // =================================================

        onConnect: (frame) => {

            console.log(
                "===================================="
            );

            console.log(
                "🟢 WEBSOCKET CONNECTED"
            );

            console.log(
                "FRAME:",
                frame
            );

            console.log(
                "===================================="
            );


            connected = true;


            if (onConnected) {

                onConnected();

            }

        },


        // =================================================
        // DISCONNECTED
        // =================================================

        onDisconnect: (frame) => {

            console.log(
                "===================================="
            );

            console.log(
                "🔴 WEBSOCKET DISCONNECTED"
            );

            console.log(
                "FRAME:",
                frame
            );

            console.log(
                "===================================="
            );


            connected = false;


            if (onDisconnected) {

                onDisconnected();

            }

        },


        // =================================================
        // WEBSOCKET ERROR
        // =================================================

        onWebSocketError: (error) => {

            console.error(
                "===================================="
            );

            console.error(
                "❌ WEBSOCKET ERROR"
            );

            console.error(
                error
            );

            console.error(
                "===================================="
            );


            connected = false;


            if (onError) {

                onError(
                    error
                );

            }

        },


        // =================================================
        // STOMP ERROR
        // =================================================

        onStompError: (frame) => {

            console.error(
                "===================================="
            );

            console.error(
                "❌ STOMP BROKER ERROR"
            );

            console.error(
                "MESSAGE:",
                frame.headers?.message
            );

            console.error(
                "BODY:",
                frame.body
            );

            console.error(
                "===================================="
            );


            connected = false;


            if (onError) {

                const error =
                    new Error(
                        frame.headers?.message ||
                        "STOMP broker error"
                    );


                error.frame =
                    frame;


                onError(error);

            }

        }

    });


    // =====================================================
    // ACTIVATE
    // =====================================================

    console.log(
        "ACTIVATING STOMP CLIENT..."
    );


    try {

        stompClient.activate();

    } catch (error) {

        console.error(
            "STOMP ACTIVATE ERROR:",
            error
        );


        connected = false;


        if (onError) {

            onError(
                error
            );

        }

    }


    return stompClient;

}


// =========================================================
// SUBSCRIBE TO CHAT
// =========================================================

export function subscribeToChat(
    connectionId,
    messageCallback
) {

    console.log(
        "===================================="
    );

    console.log(
        "SUBSCRIBE TO CHAT"
    );

    console.log(
        "CONNECTION ID:",
        connectionId
    );

    console.log(
        "CONNECTED:",
        connected
    );

    console.log(
        "===================================="
    );


    // =====================================================
    // CLIENT CHECK
    // =====================================================

    if (!stompClient) {

        console.error(
            "SUBSCRIBE ERROR: CLIENT IS NULL"
        );

        return null;

    }


    // =====================================================
    // CONNECTION CHECK
    // =====================================================

    if (!connected) {

        console.error(
            "SUBSCRIBE ERROR: NOT CONNECTED"
        );

        return null;

    }


    // =====================================================
    // CONNECTION ID
    // =====================================================

    const numericConnectionId =
        Number(connectionId);


    if (
        !Number.isInteger(
            numericConnectionId
        ) ||
        numericConnectionId <= 0
    ) {

        console.error(
            "SUBSCRIBE ERROR: INVALID CONNECTION ID"
        );

        return null;

    }


    // =====================================================
    // DESTINATION
    // =====================================================

    const destination =
        `/topic/chat/${numericConnectionId}`;


    console.log(
        "CHAT DESTINATION:",
        destination
    );


    // =====================================================
    // SUBSCRIBE
    // =====================================================

    try {

        const subscription =
            stompClient.subscribe(
                destination,
                (message) => {

                    console.log(
                        "===================================="
                    );

                    console.log(
                        "📩 NEW CHAT MESSAGE"
                    );

                    console.log(
                        "RAW MESSAGE:",
                        message.body
                    );

                    console.log(
                        "===================================="
                    );


                    try {

                        const newMessage =
                            JSON.parse(
                                message.body
                            );


                        console.log(
                            "PARSED MESSAGE:",
                            newMessage
                        );


                        if (
                            messageCallback
                        ) {

                            messageCallback(
                                newMessage
                            );

                        }

                    } catch (error) {

                        console.error(
                            "CHAT MESSAGE PARSE ERROR:",
                            error
                        );

                    }

                }
            );


        console.log(
            "CHAT SUBSCRIPTION CREATED:",
            subscription
        );


        return subscription;

    } catch (error) {

        console.error(
            "CHAT SUBSCRIPTION ERROR:",
            error
        );


        return null;

    }

}


// =========================================================
// SEND MESSAGE
// =========================================================

export function sendMessage(
    connectionId,
    content
) {

    console.log(
        "===================================="
    );

    console.log(
        "SEND WEBSOCKET MESSAGE"
    );

    console.log(
        "CONNECTION ID:",
        connectionId
    );

    console.log(
        "CONTENT:",
        content
    );

    console.log(
        "CONNECTED:",
        connected
    );

    console.log(
        "===================================="
    );


    // =====================================================
    // CLIENT CHECK
    // =====================================================

    if (!stompClient) {

        console.error(
            "SEND ERROR: CLIENT IS NULL"
        );

        return false;

    }


    // =====================================================
    // CONNECTION CHECK
    // =====================================================

    if (!connected) {

        console.error(
            "SEND ERROR: WEBSOCKET NOT CONNECTED"
        );

        return false;

    }


    // =====================================================
    // VALIDATE CONNECTION ID
    // =====================================================

    const numericConnectionId =
        Number(connectionId);


    if (
        !Number.isInteger(
            numericConnectionId
        ) ||
        numericConnectionId <= 0
    ) {

        console.error(
            "SEND ERROR: INVALID CONNECTION ID"
        );

        return false;

    }


    // =====================================================
    // VALIDATE CONTENT
    // =====================================================

    if (
        !content ||
        !content.trim()
    ) {

        console.error(
            "SEND ERROR: EMPTY MESSAGE"
        );

        return false;

    }


    // =====================================================
    // MESSAGE DESTINATION
    // =====================================================

    const destination =
        "/app/chat/send";


    // =====================================================
    // MESSAGE BODY
    // =====================================================

    const body = {

        connectionId:
            numericConnectionId,

        content:
            content.trim()

    };


    console.log(
        "SEND DESTINATION:",
        destination
    );

    console.log(
        "SEND BODY:",
        body
    );


    // =====================================================
    // PUBLISH
    // =====================================================

    try {

        stompClient.publish({

            destination:

                destination,

            body:

                JSON.stringify(
                    body
                )

        });


        console.log(
            "✅ WEBSOCKET MESSAGE SENT"
        );


        return true;

    } catch (error) {

        console.error(
            "❌ WEBSOCKET SEND ERROR:",
            error
        );


        return false;

    }

}


// =========================================================
// DISCONNECT WEBSOCKET
// =========================================================

export function disconnectWebSocket() {

    console.log(
        "===================================="
    );

    console.log(
        "DISCONNECTING WEBSOCKET"
    );

    console.log(
        "===================================="
    );


    connected = false;


    if (!stompClient) {

        console.log(
            "NO STOMP CLIENT TO DISCONNECT"
        );

        return;

    }


    try {

        stompClient.deactivate();

    } catch (error) {

        console.error(
            "WEBSOCKET DISCONNECT ERROR:",
            error
        );

    }


    stompClient = null;

}