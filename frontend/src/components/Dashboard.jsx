import { useEffect, useState } from "react";
import "./Dashboard.css";

import API_URL from "../config";

function Dashboard({ onNavigate }) {

    // ==========================
    // STATE
    // ==========================

    const [user, setUser] = useState(null);

    const [matches, setMatches] = useState([]);

    const [connections, setConnections] = useState([]);

    const [skills, setSkills] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const token =
        localStorage.getItem("token");


    // ==========================
    // LOAD DASHBOARD
    // ==========================

    useEffect(() => {

        loadDashboard();

    }, []);


    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError("");


            const headers = {
                Authorization:
                    `Bearer ${token}`
            };


            // ==========================
            // CURRENT USER
            // ==========================

            const userResponse =
                await fetch(
                    `${API_URL}/api/users/me`,
                    {
                        headers
                    }
                );


            if (userResponse.ok) {

                const userData =
                    await userResponse.json();

                setUser(userData);

            }


            // ==========================
            // MY SKILLS
            // ==========================

            const skillsResponse =
                await fetch(
                    `${API_URL}/api/users/me/skills`,
                    {
                        headers
                    }
                );


            if (skillsResponse.ok) {

                const skillsData =
                    await skillsResponse.json();

                setSkills(skillsData);

            }


            // ==========================
            // MATCHES
            // ==========================

            const matchResponse =
                await fetch(
                    `${API_URL}/api/matches`,
                    {
                        headers
                    }
                );


            if (matchResponse.ok) {

                const matchData =
                    await matchResponse.json();

                setMatches(matchData);

            }


            // ==========================
            // CONNECTIONS
            // ==========================

            const connectionResponse =
                await fetch(
                    `${API_URL}/api/connections/accepted`,
                    {
                        headers
                    }
                );


            if (connectionResponse.ok) {

                const connectionData =
                    await connectionResponse.json();

                setConnections(
                    connectionData
                );

            }


        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

            setError(
                "Unable to load dashboard data"
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================
    // LOADING
    // ==========================

    if (loading) {

        return (
            <div className="dashboard-loading">

                <div className="dashboard-loader">
                    ⏳
                </div>

                <h3>
                    Loading your dashboard...
                </h3>

            </div>
        );

    }


    // ==========================
    // ERROR
    // ==========================

    if (error) {

        return (
            <div className="dashboard-error">

                <div>
                    ⚠️
                </div>

                <h3>
                    Something went wrong
                </h3>

                <p>
                    {error}
                </p>

                <button
                    onClick={loadDashboard}
                >
                    Try Again
                </button>

            </div>
        );

    }


    return (

        <div className="dashboard">


            {/* ==========================
                HERO
            ========================== */}

            <section className="dashboard-hero">

                <div>

                    <p className="dashboard-label">
                        SKILLBRIDGE
                    </p>


                    <h1>

                        Welcome back
                        {user?.firstName
                            ? `, ${user.firstName}`
                            : ""} 👋

                    </h1>


                    <p>
                        Connect with people who can
                        teach what you want to learn.
                    </p>

                </div>


                <div className="hero-icon">
                    🎓
                </div>

            </section>


            {/* ==========================
                STATISTICS
            ========================== */}

            <section className="dashboard-stats">


                {/* MATCHES */}

                <div className="stat-card">

                    <div className="stat-icon">
                        🎯
                    </div>

                    <div>

                        <h3>
                            {matches.length}
                        </h3>

                        <p>
                            Matches
                        </p>

                    </div>

                </div>


                {/* CONNECTIONS */}

                <div className="stat-card">

                    <div className="stat-icon">
                        🤝
                    </div>

                    <div>

                        <h3>
                            {connections.length}
                        </h3>

                        <p>
                            Connections
                        </p>

                    </div>

                </div>


                {/* SKILLS */}

                <div className="stat-card">

                    <div className="stat-icon">
                        💡
                    </div>

                    <div>

                        <h3>
                            {skills.length}
                        </h3>

                        <p>
                            My Skills
                        </p>

                    </div>

                </div>

            </section>


            {/* ==========================
                QUICK ACTIONS
            ========================== */}

            <section className="dashboard-section">

                <div className="section-title">

                    <h2>
                        Quick Actions
                    </h2>

                    <p>
                        Manage your SkillBridge activities
                    </p>

                </div>


                <div className="quick-actions">


                    {/* ==========================
                        PROFILE
                    ========================== */}

                    <button
                        onClick={() =>
                            onNavigate("profile")
                        }
                    >

                        <span>
                            👤
                        </span>

                        <div>

                            <strong>
                                My Profile
                            </strong>

                            <small>
                                View your profile
                            </small>

                        </div>

                    </button>


                    {/* ==========================
                        MANAGE SKILLS
                    ========================== */}

                    <button
                        onClick={() =>
                            onNavigate("skills")
                        }
                    >

                        <span>
                            💡
                        </span>

                        <div>

                            <strong>
                                Manage Skills
                            </strong>

                            <small>
                                Add or update your skills
                            </small>

                        </div>

                    </button>


                    {/* ==========================
                        CONNECTIONS
                    ========================== */}

                    <button
                        onClick={() =>
                            onNavigate("connections")
                        }
                    >

                        <span>
                            🤝
                        </span>

                        <div>

                            <strong>
                                My Connections
                            </strong>

                            <small>
                                View your connections
                            </small>

                        </div>

                    </button>


                    {/* ==========================
                        REQUESTS
                    ========================== */}

                    <button
                        onClick={() =>
                            onNavigate("requests")
                        }
                    >

                        <span>
                            📨
                        </span>

                        <div>

                            <strong>
                                Connection Requests
                            </strong>

                            <small>
                                Manage incoming requests
                            </small>

                        </div>

                    </button>


                </div>

            </section>


            {/* ==========================
                RECOMMENDED MATCHES
            ========================== */}

            <section className="dashboard-section">


                <div className="section-heading-row">

                    <div>

                        <h2>
                            Recommended Matches
                        </h2>

                        <p>
                            People who may be a great
                            skill exchange partner
                        </p>

                    </div>


                    <button
    className="view-all-button"
    onClick={() => onNavigate("matches")}
>
    View All Matches
</button>

                </div>


                {/* ==========================
                    NO MATCHES
                ========================== */}

                {matches.length === 0 ? (

                    <div className="empty-card">

                        <span>
                            🔍
                        </span>

                        <h3>
                            No matches yet
                        </h3>

                        <p>
                            Add your teaching and
                            learning skills to find
                            compatible users.
                        </p>

                        <button
                            className="empty-action-button"
                            onClick={() =>
                                onNavigate("skills")
                            }
                        >
                            Add Skills
                        </button>

                    </div>

                ) : (


                    /* ==========================
                       MATCH GRID
                    ========================== */

                    <div className="match-grid">

                        {matches
                            .slice(0, 3)
                            .map((match) => (

                                <div
                                    className="match-card"
                                    key={match.userId}
                                >


                                    {/* ==========================
                                        MATCH HEADER
                                    ========================== */}

                                    <div className="match-top">


                                        <div className="avatar">

                                            {match.firstName
                                                ?.charAt(0)
                                                .toUpperCase()}

                                        </div>


                                        <div>

                                            <h3>

                                                {match.firstName}{" "}

                                                {match.lastName}

                                            </h3>


                                            <p>
                                                {match.email}
                                            </p>

                                        </div>


                                        <div className="match-score">

                                            {match.matchScore}%

                                        </div>

                                    </div>


                                    {/* ==========================
                                        MATCH SKILLS
                                    ========================== */}

                                    <div className="match-skills">


                                        {/* YOU CAN TEACH */}

                                        <div>

                                            <span>
                                                You can teach
                                            </span>

                                            <p>

                                                {match.youCanTeach
                                                    ?.join(", ") ||
                                                    "Not specified"}

                                            </p>

                                        </div>


                                        {/* YOU CAN LEARN */}

                                        <div>

                                            <span>
                                                You can learn
                                            </span>

                                            <p>

                                                {match.youCanLearn
                                                    ?.join(", ") ||
                                                    "Not specified"}

                                            </p>

                                        </div>


                                        {/* THEY CAN TEACH */}

                                        <div>

                                            <span>
                                                They can teach
                                            </span>

                                            <p>

                                                {match.theyCanTeach
                                                    ?.join(", ") ||
                                                    "Not specified"}

                                            </p>

                                        </div>


                                    </div>

                                </div>

                            ))}

                    </div>

                )}

            </section>

        </div>

    );
}


export default Dashboard;