import "./Footer.css";

function Footer({ onNavigate }) {

    const handleNavigation = (page) => {
        if (onNavigate) {
            onNavigate(page);
        }
    };

    return (
        <footer className="app-footer">

            <div className="footer-content">

                {/* BRAND */}
                <div className="footer-section footer-brand">
                    <h3>SkillBridge</h3>

                    <p>
                        Skill Exchange & Learning Platform
                    </p>

                    <p className="footer-description">
                        Connect with people, exchange skills,
                        learn something new and grow together.
                    </p>
                </div>


                {/* QUICK LINKS */}
                <div className="footer-section">

                    <h4>Quick Links</h4>

                    <button
                        onClick={() =>
                            handleNavigation("dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("matches")
                        }
                    >
                        Matches
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("discover")
                        }
                    >
                        Discover Users
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("connections")
                        }
                    >
                        My Connections
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("requests")
                        }
                    >
                        Connection Requests
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("profile")
                        }
                    >
                        Profile
                    </button>

                </div>


                {/* SKILLS */}
                <div className="footer-section">

                    <h4>SkillBridge</h4>

                    <button
                        onClick={() =>
                            handleNavigation("skills")
                        }
                    >
                        Manage Skills
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("matches")
                        }
                    >
                        Find Matches
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("discover")
                        }
                    >
                        Find Users
                    </button>

                </div>


                {/* COPYRIGHT */}
                <div className="footer-section footer-copyright">

                    <h4>Connect • Learn • Teach • Grow</h4>

                    <p>
                        © 2026 SkillBridge.
                    </p>

                    <p>
                        All Rights Reserved.
                    </p>

                </div>

            </div>


            {/* BOTTOM FOOTER */}

            <div className="footer-bottom">

                <p>
                    © 2026 SkillBridge. All Rights Reserved.
                </p>

                <p>
                    Skill Exchange & Learning Platform
                </p>

            </div>

        </footer>
    );
}

export default Footer;