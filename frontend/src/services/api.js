const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

/* =========================================================
   TOKEN
========================================================= */

const getToken = () => {
    return localStorage.getItem("token");
};


/* =========================================================
   AUTH HEADERS
========================================================= */

const getAuthHeaders = () => {
    const token = getToken();

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};


/* =========================================================
   API ERROR PARSER
========================================================= */

const parseApiError = async (response) => {
    let message = "Something went wrong.";

    try {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();

            if (data?.message) {
                message = data.message;
            } else if (data?.error) {
                message = data.error;
            } else if (data?.errors) {
                if (typeof data.errors === "object") {
                    message = Object.values(data.errors)
                        .filter(Boolean)
                        .join(", ");
                }
            }
        } else {
            const text = await response.text();

            if (text) {
                message = text;
            }
        }
    } catch (error) {
        console.error("Error parsing API response:", error);
    }

    switch (response.status) {
        case 400:
            return message || "Invalid request.";

        case 401:
            localStorage.removeItem("token");
            return "Your session has expired. Please login again.";

        case 403:
            return "You do not have permission to perform this action.";

        case 404:
            return "The requested resource was not found.";

        case 409:
            return message || "This request conflicts with existing data.";

        case 422:
            return message || "The submitted data is invalid.";

        case 500:
            return "Server error. Please try again later.";

        default:
            return message || `Request failed with status ${response.status}.`;
    }
};


/* =========================================================
   COMMON API REQUEST
========================================================= */

const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            const errorMessage = await parseApiError(response);

            console.error(
                `API Error [${response.status}] ${options.method || "GET"} ${endpoint}:`,
                errorMessage
            );

            throw new Error(errorMessage);
        }

        /*
         * 204 No Content
         */
        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get("content-type");

        /*
         * JSON response
         */
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }

        /*
         * Text response
         */
        return await response.text();

    } catch (error) {
        console.error(
            `API Request Failed: ${options.method || "GET"} ${endpoint}`,
            error
        );

        throw error;
    }
};


/* =========================================================
   CURRENT USER
========================================================= */

const getCurrentUser = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("Please login to continue.");
    }

    try {
        return await apiRequest("/api/users/me", {
            method: "GET",
        });
    } catch (error) {
        console.error("Failed to get current user:", error);
        throw error;
    }
};


/* =========================================================
   GET MY CONNECTIONS
========================================================= */

const getConnections = async () => {
    const token = getToken();

    if (!token) {
        return [];
    }

    try {
        const data = await apiRequest("/api/connections", {
            method: "GET",
        });

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Failed to load connections:", error);
        throw error;
    }
};


/* =========================================================
   GET MESSAGES
========================================================= */

const getMessages = async (connectionId) => {
    const token = getToken();

    if (!token) {
        return [];
    }

    if (!connectionId) {
        throw new Error("Connection ID is required.");
    }

    try {
        const data = await apiRequest(
            `/api/messages/${connectionId}`,
            {
                method: "GET",
            }
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(
            `Failed to load messages for connection ${connectionId}:`,
            error
        );

        throw error;
    }
};


/* =========================================================
   MARK MESSAGES AS READ
========================================================= */

const markMessagesAsRead = async (connectionId) => {
    const token = getToken();

    if (!token) {
        return false;
    }

    if (!connectionId) {
        return false;
    }

    try {
        await apiRequest(
            `/api/messages/${connectionId}/read`,
            {
                method: "PUT",
            }
        );

        return true;
    } catch (error) {
        console.error(
            `Failed to mark messages as read for connection ${connectionId}:`,
            error
        );

        throw error;
    }
};


/* =========================================================
   GET UNREAD MESSAGE COUNT
========================================================= */

const getUnreadMessageCount = async () => {
    const token = getToken();

    if (!token) {
        return 0;
    }

    try {
        const data = await apiRequest(
            "/api/messages/unread-count",
            {
                method: "GET",
            }
        );

        /*
         * Backend returns a number
         */
        if (typeof data === "number") {
            return data;
        }

        /*
         * Backend may return a numeric string
         */
        if (typeof data === "string") {
            const count = Number(data);

            return Number.isNaN(count) ? 0 : count;
        }

        /*
         * Supports:
         * { count: 5 }
         */
        if (
            data &&
            typeof data === "object" &&
            typeof data.count === "number"
        ) {
            return data.count;
        }

        return 0;

    } catch (error) {
        console.error("Failed to load unread message count:", error);
        throw error;
    }
};


/* =========================================================
   SEND MESSAGE
========================================================= */

const sendMessage = async (connectionId, content) => {
    const token = getToken();

    if (!token) {
        throw new Error("Please login to send a message.");
    }

    if (!connectionId) {
        throw new Error("Connection ID is required.");
    }

    if (!content || !content.trim()) {
        throw new Error("Message cannot be empty.");
    }

    try {
        return await apiRequest(
            `/api/messages/${connectionId}`,
            {
                method: "POST",
                body: JSON.stringify({
                    content: content.trim(),
                }),
            }
        );
    } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
    }
};


/* =========================================================
   EXPORT
========================================================= */

export {
    API_URL,
    getToken,
    getAuthHeaders,
    getCurrentUser,
    getConnections,
    getMessages,
    markMessagesAsRead,
    getUnreadMessageCount,
    sendMessage,
};