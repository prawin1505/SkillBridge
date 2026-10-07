import { useEffect, useState } from "react";
import "./NotificationBell.css";

import API_URL from "../config";

function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // ==========================
    // LOAD NOTIFICATIONS
    // ==========================

    const loadNotifications = async () => {

        const token = getToken();

        if (!token) return;

        try {

            const response = await fetch(
                `${API_URL}/api/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                console.error(
                    "Notification request failed:",
                    response.status
                );
                return;
            }

            const data = await response.json();

            setNotifications(data);

        } catch (error) {

            console.error(
                "Error loading notifications:",
                error
            );
        }
    };

    // ==========================
    // LOAD UNREAD COUNT
    // ==========================

    const loadUnreadCount = async () => {

        const token = getToken();

        if (!token) return;

        try {

            const response = await fetch(
                `${API_URL}/api/notifications/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) return;

            const count = await response.json();

            setUnreadCount(count);

        } catch (error) {

            console.error(
                "Error loading unread count:",
                error
            );
        }
    };

    // ==========================
    // INITIAL LOAD
    // ==========================

    useEffect(() => {

        loadNotifications();
        loadUnreadCount();

    }, []);

    // ==========================
    // REFRESH EVERY 5 SECONDS
    // ==========================

    useEffect(() => {

        const interval = setInterval(() => {

            loadNotifications();
            loadUnreadCount();

        }, 5000);

        return () => clearInterval(interval);

    }, []);

    // ==========================
    // MARK ONE AS READ
    // ==========================

    const markAsRead = async (id) => {

        const token = getToken();

        try {

            const response = await fetch(
                `${API_URL}/api/notifications/${id}/read`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                console.error(
                    "Failed to mark notification as read"
                );
                return;
            }

            // Update UI immediately
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? {
                            ...notification,
                            read: true
                        }
                        : notification
                )
            );

            loadUnreadCount();

        } catch (error) {

            console.error(
                "Error marking notification:",
                error
            );
        }
    };

    // ==========================
    // MARK ALL AS READ
    // ==========================

    const markAllAsRead = async () => {

        const token = getToken();

        try {

            const response = await fetch(
                `${API_URL}/api/notifications/read-all`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {

                console.error(
                    "Failed to mark all notifications as read"
                );

                return;
            }

            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    read: true
                }))
            );

            setUnreadCount(0);

        } catch (error) {

            console.error(
                "Error marking all as read:",
                error
            );
        }
    };

    return (
        <div className="notification-container">

            {/* BELL */}

            <button
                className="notification-bell"
                onClick={() => setOpen(!open)}
            >

                🔔

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}

            </button>

            {/* DROPDOWN */}

            {open && (

                <div className="notification-dropdown">

                    <div className="notification-header">

                        <strong>
                            Notifications
                        </strong>

                        {unreadCount > 0 && (

                            <button
                                className="mark-all-button"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>

                        )}

                    </div>

                    <div className="notification-list">

                        {notifications.length === 0 ? (

                            <div className="no-notifications">
                                No notifications
                            </div>

                        ) : (

                            notifications.map(notification => (

                                <div
                                    key={notification.id}
                                    className={
                                        notification.read
                                            ? "notification-item"
                                            : "notification-item unread"
                                    }
                                    onClick={() =>
                                        !notification.read &&
                                        markAsRead(notification.id)
                                    }
                                >

                                    <div className="notification-icon">
                                        🔔
                                    </div>

                                    <div className="notification-content">

                                        <div className="notification-message">
                                            {notification.message}
                                        </div>

                                        <div className="notification-time">
                                            {new Date(
                                                notification.createdAt
                                            ).toLocaleString()}
                                        </div>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}

export default NotificationBell;