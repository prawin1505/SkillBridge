import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

function NotificationBadge() {

    const [unreadCount, setUnreadCount] = useState(0);

    const loadUnreadCount = async () => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                setUnreadCount(0);
                return;
            }

            const response = await fetch(
                `${API_URL}/api/messages/unread/count`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) {
                console.error(
                    "Unread count error:",
                    response.status
                );
                return;
            }

            const data = await response.json();

            console.log(
                "🔔 UNREAD MESSAGE COUNT:",
                data.unreadCount
            );

            setUnreadCount(data.unreadCount || 0);

        } catch (error) {

            console.error(
                "❌ Failed to load unread count:",
                error
            );

        }
    };

    useEffect(() => {

        // Load immediately
        loadUnreadCount();

        // Refresh every 3 seconds
        const interval = setInterval(() => {
            loadUnreadCount();
        }, 3000);

        // Cleanup
        return () => {
            clearInterval(interval);
        };

    }, []);

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "8px",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor:
                    unreadCount > 0 ? "red" : "transparent",
                color:
                    unreadCount > 0 ? "white" : "transparent",
                fontSize: "13px",
                fontWeight: "bold"
            }}
        >
            {unreadCount > 0 ? unreadCount : ""}
        </span>
    );
}

export default NotificationBadge;