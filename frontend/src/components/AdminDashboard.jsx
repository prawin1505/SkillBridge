import { useEffect, useState } from "react";

import "./AdminDashboard.css";



import API_URL from "../config";



function AdminDashboard({ onLogout }) {



    const [stats, setStats] = useState({

        totalUsers: 0,

        activeUsers: 0,

        inactiveUsers: 0,

        verifiedUsers: 0,

        adminUsers: 0,

        normalUsers: 0,

        totalConnections: 0,

        totalReports: 0,

        pendingReports: 0,

        resolvedReports: 0,

        dismissedReports: 0

    });



    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");



    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");

    // ==========================================
    // REPORTS
    // ==========================================

    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [reportActionLoading, setReportActionLoading] = useState(null);



    const token = localStorage.getItem("token");



    // ==========================================

    // HEADERS

    // ==========================================



    const getHeaders = () => ({

        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json"

    });



    // ==========================================

    // LOAD DASHBOARD DATA

    // ==========================================



    const loadDashboard = async () => {



        setLoading(true);

        setError("");



        try {



            const [statsResponse, usersResponse] =

                await Promise.all([

                    fetch(

                        `${API_URL}/api/admin/stats`,

                        {

                            method: "GET",

                            headers: getHeaders()

                        }

                    ),


                    fetch(

                        `${API_URL}/api/admin/users`,

                        {

                            method: "GET",

                            headers: getHeaders()

                        }

                    )

                ]);



            if (

                statsResponse.status === 401 ||

                statsResponse.status === 403 ||

                usersResponse.status === 401 ||

                usersResponse.status === 403

            ) {

                throw new Error(

                    "You are not authorized to access the Admin Dashboard."

                );

            }



            if (!statsResponse.ok) {

                throw new Error(

                    "Unable to load dashboard statistics."

                );

            }



            if (!usersResponse.ok) {

                throw new Error(

                    "Unable to load users."

                );

            }



            const statsData =

                await statsResponse.json();



            const usersData =

                await usersResponse.json();



            setStats(statsData);



            setUsers(

                Array.isArray(usersData)

                    ? usersData

                    : []

            );



        } catch (err) {



            console.error(

                "ADMIN DASHBOARD ERROR:",

                err

            );



            setError(

                err.message ||

                "Unable to load Admin Dashboard."

            );



        } finally {



            setLoading(false);

        }

    };



    // ==========================================

    // ==========================================

    // LOAD ANALYTICS

    // ==========================================

    const loadAnalytics = async () => {

        try {

            const response = await fetch(
                `${API_URL}/api/admin/analytics`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

            if (response.status === 401 || response.status === 403) {
                throw new Error("You are not authorized to view admin analytics.");
            }

            if (!response.ok) {
                throw new Error("Unable to load admin analytics.");
            }

            const data = await response.json();

            setStats(previous => ({
                ...previous,
                ...data
            }));

        } catch (err) {

            console.error("LOAD ANALYTICS ERROR:", err);

            setError(err.message || "Unable to load admin analytics.");
        }
    };


    // ==========================================

    // LOAD REPORTS

    // ==========================================


    const loadReports = async () => {

        setReportsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/reports/admin`,
                { method: "GET", headers: getHeaders() }
            );

            if (response.status === 401 || response.status === 403) {
                throw new Error("You are not authorized to view reports.");
            }

            if (!response.ok) throw new Error("Unable to load reports.");

            const data = await response.json();
            setReports(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("LOAD REPORTS ERROR:", err);
            setError(err.message || "Unable to load reports.");
        } finally {
            setReportsLoading(false);
        }
    };

    const handleResolveReport = async (reportId) => {
        setReportActionLoading(reportId);
        setError("");
        try {
            const response = await fetch(
                `${API_URL}/api/reports/admin/${reportId}/resolve`,
                { method: "PUT", headers: getHeaders() }
            );
            if (!response.ok) throw new Error("Unable to resolve report.");
            await loadReports();
            await loadAnalytics();
        } catch (err) {
            console.error("RESOLVE REPORT ERROR:", err);
            setError(err.message || "Unable to resolve report.");
        } finally {
            setReportActionLoading(null);
        }
    };

    const handleDismissReport = async (reportId) => {
        setReportActionLoading(reportId);
        setError("");
        try {
            const response = await fetch(
                `${API_URL}/api/reports/admin/${reportId}/dismiss`,
                { method: "PUT", headers: getHeaders() }
            );
            if (!response.ok) throw new Error("Unable to dismiss report.");
            await loadReports();
            await loadAnalytics();
        } catch (err) {
            console.error("DISMISS REPORT ERROR:", err);
            setError(err.message || "Unable to dismiss report.");
        } finally {
            setReportActionLoading(null);
        }
    };

    // INITIAL LOAD

    // ==========================================



    useEffect(() => {
        loadDashboard();
        loadAnalytics();
        loadReports();
    }, []);



    // ==========================================

    // SEARCH USERS

    // ==========================================



    const filteredUsers = users.filter(user => {



        const keyword =

            search.trim().toLowerCase();



        if (!keyword) {

            return true;

        }



        return (

            `${user.firstName} ${user.lastName}`

                .toLowerCase()

                .includes(keyword) ||



            (user.email || "")

                .toLowerCase()

                .includes(keyword) ||



            (user.role || "")

                .toLowerCase()

                .includes(keyword)

        );

    });



    // ==========================================

    // TOGGLE USER STATUS

    // ==========================================



    const handleStatusChange = async (

        userId,

        currentStatus

    ) => {



        setActionLoading(userId);

        setError("");



        try {



            const response = await fetch(

                `${API_URL}/api/admin/users/${userId}/status?active=${!currentStatus}`,

                {

                    method: "PUT",

                    headers: getHeaders()

                }

            );



            if (!response.ok) {



                if (response.status === 403) {

                    throw new Error(

                        "You are not authorized to perform this action."

                    );

                }



                throw new Error(

                    "Unable to update user status."

                );

            }



            await loadDashboard();



        } catch (err) {



            console.error(

                "STATUS UPDATE ERROR:",

                err

            );



            setError(

                err.message ||

                "Unable to update user status."

            );



        } finally {



            setActionLoading(null);

        }

    };



    // ==========================================

    // DELETE USER

    // ==========================================



    const handleDeleteUser = async (user) => {



        const confirmed = window.confirm(

            `Are you sure you want to delete ${user.firstName} ${user.lastName}?`

        );



        if (!confirmed) {

            return;

        }



        setActionLoading(user.id);

        setError("");



        try {



            const response = await fetch(

                `${API_URL}/api/admin/users/${user.id}`,

                {

                    method: "DELETE",

                    headers: getHeaders()

                }

            );



            if (!response.ok) {



                if (response.status === 403) {

                    throw new Error(

                        "You are not authorized to delete users."

                    );

                }



                throw new Error(

                    "Unable to delete user."

                );

            }



            await loadDashboard();



        } catch (err) {



            console.error(

                "DELETE USER ERROR:",

                err

            );



            setError(

                err.message ||

                "Unable to delete user."

            );



        } finally {



            setActionLoading(null);

        }

    };



    // ==========================================

    // LOADING

    // ==========================================



    if (loading) {



        return (

            <div className="admin-page">



                <div className="admin-loading">



                    <div className="admin-spinner">

                        ⏳

                    </div>



                    <h2>

                        Loading Admin Dashboard...

                    </h2>



                    <p>

                        Please wait.

                    </p>



                </div>



            </div>

        );

    }



    // ==========================================

    // ERROR

    // ==========================================



    if (error && users.length === 0) {



        return (

            <div className="admin-page">



                <div className="admin-error-card">



                    <div className="admin-error-icon">

                        ⚠️

                    </div>



                    <h2>

                        Admin Dashboard

                    </h2>



                    <p>

                        {error}

                    </p>



                    <button

                        className="admin-primary-button"

                        onClick={loadDashboard}

                    >

                        Try Again

                    </button>



                    {onLogout && (

                        <button

                            className="admin-secondary-button"

                            onClick={onLogout}

                        >

                            Logout

                        </button>

                    )}



                </div>



            </div>

        );

    }



    // ==========================================

    // DASHBOARD

    // ==========================================



    return (

        <div className="admin-page">



            {/* ======================================

                HEADER

            ====================================== */}



            <header className="admin-header">



                <div>

                    <h1>

                        SkillBridge Admin

                    </h1>



                    <p>

                        Platform Management Dashboard

                    </p>

                </div>



                <div className="admin-header-actions">



                    <button

                        className="admin-refresh-button"

                        onClick={() => {
                            loadDashboard();
                            loadAnalytics();
                            loadReports();
                        }}

                        disabled={loading}

                    >

                        ↻ Refresh

                    </button>



                    {onLogout && (

                        <button

                            className="admin-logout-button"

                            onClick={onLogout}

                        >

                            Logout

                        </button>

                    )}



                </div>



            </header>



            {/* ======================================

                CONTENT

            ====================================== */}



            <main className="admin-content">



                {/* ==================================

                    STATISTICS

                ================================== */}



                <section className="admin-stats-grid">



                    <div className="admin-stat-card">



                        <div className="admin-stat-icon">

                            👥

                        </div>



                        <div>

                            <span>Total Users</span>

                            <strong>

                                {stats.totalUsers}

                            </strong>

                        </div>



                    </div>



                    <div className="admin-stat-card">



                        <div className="admin-stat-icon">

                            🟢

                        </div>



                        <div>

                            <span>Active Users</span>

                            <strong>

                                {stats.activeUsers}

                            </strong>

                        </div>



                    </div>



                    <div className="admin-stat-card">



                        <div className="admin-stat-icon">

                            ⚪

                        </div>



                        <div>

                            <span>Inactive Users</span>

                            <strong>

                                {stats.inactiveUsers}

                            </strong>

                        </div>



                    </div>



                    <div className="admin-stat-card">



                        <div className="admin-stat-icon">

                            🛡️

                        </div>



                        <div>

                            <span>Admin Users</span>

                            <strong>

                                {stats.adminUsers}

                            </strong>

                        </div>



                    </div>



                    <div className="admin-stat-card">



                        <div className="admin-stat-icon">

                            ✓

                        </div>



                        <div>

                            <span>Verified Users</span>

                            <strong>

                                {stats.verifiedUsers}

                            </strong>

                        </div>



                    </div>



                    <div className="admin-stat-card">



                        <div className="admin-stat-icon">

                            👤

                        </div>



                        <div>

                            <span>Normal Users</span>

                            <strong>

                                {stats.normalUsers}

                            </strong>

                        </div>



                    </div>



                </section>



                {/* ==================================
                    ANALYTICS OVERVIEW
                ================================== */}

                <section className="admin-analytics-section">

                    <div className="admin-section-header">

                        <div>
                            <h2>📊 Platform Analytics</h2>
                            <p>Overview of connections and user reports</p>
                        </div>

                        <button
                            className="admin-analytics-refresh"
                            onClick={loadAnalytics}
                        >
                            ↻ Refresh Analytics
                        </button>

                    </div>

                    <div className="admin-analytics-grid">

                        <div className="admin-analytics-card connections">
                            <div className="admin-analytics-icon">🔗</div>
                            <div>
                                <span>Total Connections</span>
                                <strong>{stats.totalConnections}</strong>
                                <small>SkillBridge connections</small>
                            </div>
                        </div>

                        <div className="admin-analytics-card reports">
                            <div className="admin-analytics-icon">🚩</div>
                            <div>
                                <span>Total Reports</span>
                                <strong>{stats.totalReports}</strong>
                                <small>All submitted reports</small>
                            </div>
                        </div>

                        <div className="admin-analytics-card pending">
                            <div className="admin-analytics-icon">⏳</div>
                            <div>
                                <span>Pending Reports</span>
                                <strong>{stats.pendingReports}</strong>
                                <small>Awaiting moderation</small>
                            </div>
                        </div>

                        <div className="admin-analytics-card resolved">
                            <div className="admin-analytics-icon">✅</div>
                            <div>
                                <span>Resolved Reports</span>
                                <strong>{stats.resolvedReports}</strong>
                                <small>Action taken</small>
                            </div>
                        </div>

                        <div className="admin-analytics-card dismissed">
                            <div className="admin-analytics-icon">↩️</div>
                            <div>
                                <span>Dismissed Reports</span>
                                <strong>{stats.dismissedReports}</strong>
                                <small>No action required</small>
                            </div>
                        </div>

                    </div>

                    <div className="admin-analytics-panels">

                        <div className="admin-analytics-panel">

                            <div className="admin-panel-title">
                                <h3>👥 User Distribution</h3>
                                <span>{stats.totalUsers} total users</span>
                            </div>

                            <div className="admin-bar-group">

                                <div className="admin-bar-row">
                                    <div className="admin-bar-label">
                                        <span>Normal Users</span>
                                        <strong>{stats.normalUsers}</strong>
                                    </div>
                                    <div className="admin-bar-track">
                                        <div
                                            className="admin-bar-fill normal"
                                            style={{
                                                width: `${stats.totalUsers ? (stats.normalUsers / stats.totalUsers) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="admin-bar-row">
                                    <div className="admin-bar-label">
                                        <span>Admin Users</span>
                                        <strong>{stats.adminUsers}</strong>
                                    </div>
                                    <div className="admin-bar-track">
                                        <div
                                            className="admin-bar-fill admin"
                                            style={{
                                                width: `${stats.totalUsers ? (stats.adminUsers / stats.totalUsers) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="admin-bar-row">
                                    <div className="admin-bar-label">
                                        <span>Active Users</span>
                                        <strong>{stats.activeUsers}</strong>
                                    </div>
                                    <div className="admin-bar-track">
                                        <div
                                            className="admin-bar-fill active"
                                            style={{
                                                width: `${stats.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>

                        <div className="admin-analytics-panel">

                            <div className="admin-panel-title">
                                <h3>🚩 Report Overview</h3>
                                <span>{stats.totalReports} total reports</span>
                            </div>

                            <div className="admin-report-summary">

                                <div className="admin-report-summary-item pending">
                                    <span>Pending</span>
                                    <strong>{stats.pendingReports}</strong>
                                </div>

                                <div className="admin-report-summary-item resolved">
                                    <span>Resolved</span>
                                    <strong>{stats.resolvedReports}</strong>
                                </div>

                                <div className="admin-report-summary-item dismissed">
                                    <span>Dismissed</span>
                                    <strong>{stats.dismissedReports}</strong>
                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================

                    ERROR MESSAGE

                ================================== */}



                {error && (

                    <div className="admin-inline-error">

                        {error}

                    </div>

                )}



                {/* ==================================

                    USER MANAGEMENT

                ================================== */}



                <section className="admin-users-section">



                    <div className="admin-section-header">



                        <div>

                            <h2>

                                User Management

                            </h2>



                            <p>

                                Manage SkillBridge users

                            </p>

                        </div>



                        <div className="admin-user-count">

                            {filteredUsers.length} users

                        </div>



                    </div>



                    {/* SEARCH */}



                    <div className="admin-search-wrapper">



                        <span>

                            🔍

                        </span>



                        <input

                            type="text"

                            placeholder="Search by name, email or role..."

                            value={search}

                            onChange={(e) =>

                                setSearch(e.target.value)

                            }

                        />



                        {search && (

                            <button

                                className="admin-clear-search"

                                onClick={() =>

                                    setSearch("")

                                }

                            >

                                ×

                            </button>

                        )}



                    </div>



                    {/* USER TABLE */}



                    {filteredUsers.length === 0 ? (



                        <div className="admin-empty">

                            <div>🔍</div>



                            <h3>

                                No users found

                            </h3>



                            <p>

                                Try a different search.

                            </p>

                        </div>



                    ) : (



                        <div className="admin-table-wrapper">



                            <table className="admin-table">



                                <thead>

                                    <tr>

                                        <th>ID</th>

                                        <th>User</th>

                                        <th>Email</th>

                                        <th>Role</th>

                                        <th>Status</th>

                                        <th>Verified</th>

                                        <th>Actions</th>

                                    </tr>

                                </thead>



                                <tbody>



                                    {filteredUsers.map(

                                        user => (



                                            <tr key={user.id}>



                                                <td>

                                                    #{user.id}

                                                </td>



                                                <td>

                                                    <div className="admin-user-cell">



                                                        <div className="admin-avatar">

                                                            {(

                                                                user.firstName?.[0] ||

                                                                "U"

                                                            ).toUpperCase()}

                                                        </div>



                                                        <div>

                                                            <strong>

                                                                {user.firstName}{" "}

                                                                {user.lastName}

                                                            </strong>

                                                        </div>



                                                    </div>

                                                </td>



                                                <td>

                                                    {user.email}

                                                </td>



                                                <td>



                                                    <span

                                                        className={

                                                            user.role === "ADMIN"

                                                                ? "admin-role admin-role-admin"

                                                                : "admin-role admin-role-user"

                                                        }

                                                    >

                                                        {user.role}

                                                    </span>



                                                </td>



                                                <td>



                                                    <span

                                                        className={

                                                            user.active

                                                                ? "admin-status active"

                                                                : "admin-status inactive"

                                                        }

                                                    >

                                                        <span className="admin-status-dot">

                                                        </span>



                                                        {user.active

                                                            ? "Active"

                                                            : "Inactive"}

                                                    </span>



                                                </td>



                                                <td>



                                                    <span

                                                        className={

                                                            user.verified

                                                                ? "admin-verified yes"

                                                                : "admin-verified no"

                                                        }

                                                    >

                                                        {user.verified

                                                            ? "Verified"

                                                            : "Not Verified"}

                                                    </span>



                                                </td>



                                                <td>



                                                    <div className="admin-actions">



                                                        <button

                                                            className={

                                                                user.active

                                                                    ? "admin-action-button deactivate"

                                                                    : "admin-action-button activate"

                                                            }

                                                            disabled={

                                                                actionLoading ===

                                                                user.id

                                                            }

                                                            onClick={() =>

                                                                handleStatusChange(

                                                                    user.id,

                                                                    user.active

                                                                )

                                                            }

                                                        >

                                                            {actionLoading ===

                                                            user.id

                                                                ? "..."

                                                                : user.active

                                                                    ? "Deactivate"

                                                                    : "Activate"}

                                                        </button>



                                                        {user.role !== "ADMIN" && (

                                                            <button

                                                                className="admin-action-button delete"

                                                                disabled={

                                                                    actionLoading ===

                                                                    user.id

                                                                }

                                                                onClick={() =>

                                                                    handleDeleteUser(

                                                                        user

                                                                    )

                                                                }

                                                            >

                                                                Delete

                                                            </button>

                                                        )}



                                                    </div>



                                                </td>



                                            </tr>



                                        )

                                    )}



                                </tbody>



                            </table>



                        </div>



                    )}



                </section>



                {/* ==================================
                    USER REPORTS
                ================================== */}

                <section className="admin-reports-section">
                    <div className="admin-section-header">
                        <div>
                            <h2>🚩 User Reports</h2>
                            <p>Review and manage reports submitted by users</p>
                        </div>
                        <div className="admin-user-count">
                            {reports.length} reports
                        </div>
                    </div>

                    {reportsLoading ? (
                        <div className="admin-reports-loading">
                            <div className="admin-spinner">⏳</div>
                            <p>Loading reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="admin-empty">
                            <div>✅</div>
                            <h3>No reports found</h3>
                            <p>There are currently no user reports.</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead><tr>
                                    <th>ID</th><th>Reporter</th><th>Reported User</th>
                                    <th>Reason</th><th>Description</th><th>Status</th>
                                    <th>Date</th><th>Actions</th>
                                </tr></thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id}>
                                            <td>#{report.id}</td>
                                            <td><strong>{report.reporterName}</strong></td>
                                            <td><strong>{report.reportedUserName}</strong></td>
                                            <td><span className="admin-report-reason">{report.reason}</span></td>
                                            <td><div className="admin-report-description">{report.description || "No description provided"}</div></td>
                                            <td><span className={`admin-report-status ${report.status?.toLowerCase()}`}>{report.status}</span></td>
                                            <td>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "-"}</td>
                                            <td>
                                                {report.status === "PENDING" ? (
                                                    <div className="admin-report-actions">
                                                        <button className="admin-report-resolve" disabled={reportActionLoading === report.id} onClick={() => handleResolveReport(report.id)}>
                                                            {reportActionLoading === report.id ? "..." : "✓ Resolve"}
                                                        </button>
                                                        <button className="admin-report-dismiss" disabled={reportActionLoading === report.id} onClick={() => handleDismissReport(report.id)}>
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="admin-report-completed">Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </main>



        </div>

    );

}



export default AdminDashboard;