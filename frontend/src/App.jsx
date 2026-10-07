import { useEffect, useState } from "react";



import Login from "./components/Login";

import Register from "./components/Register";

import ForgotPassword from "./components/ForgotPassword";

import ResetPassword from "./components/ResetPassword";



import Dashboard from "./components/Dashboard";

import DiscoverUsers from "./components/DiscoverUsers";

import Profile from "./components/Profile";

import SkillManagement from "./components/SkillManagement";

import ProfileSetup from "./components/ProfileSetup";
import AdminDashboard from "./components/AdminDashboard";



import Chat from "./components/Chat";

import Connections from "./components/Connections";

import ConnectionRequests from "./components/ConnectionRequests";

import Matches from "./components/Matches";

import NotificationBell from "./components/NotificationBell";



import Footer from "./components/Footer";

import "./components/Footer.css";





// =========================================================

// API

// =========================================================



import API_URL from "./config";





// =========================================================

// APP

// =========================================================



function App() {



    // =========================================================

    // LOGIN STATE

    // =========================================================



    const [loggedIn, setLoggedIn] = useState(

        !!localStorage.getItem("token")

    );

    // ADMIN ROLE
    const [isAdmin, setIsAdmin] = useState(
        localStorage.getItem("role") === "ADMIN"
    );





    // =========================================================

    // AUTH PAGE

    //

    // login

    // register

    // forgot-password

    // =========================================================



    const [authPage, setAuthPage] = useState("login");





    // =========================================================

    // CURRENT APPLICATION PAGE

    // =========================================================



    const [page, setPage] = useState("dashboard");





    // =========================================================

    // SELECTED CHAT

    // =========================================================



    const [selectedChat, setSelectedChat] = useState(null);





    // =========================================================

    // PROFILE SETUP

    // =========================================================



    const [profileSetupRequired, setProfileSetupRequired] =

        useState(false);



    const [checkingProfile, setCheckingProfile] =

        useState(false);

    const [setupSkillsMode, setSetupSkillsMode] = useState(false);





    // =========================================================

    // CHECK PROFILE COMPLETION

    // =========================================================



    const checkProfileCompletion = async () => {



        const token =

            localStorage.getItem("token");





        // -----------------------------------------------------

        // NO TOKEN

        // -----------------------------------------------------



        if (!token) {



            setProfileSetupRequired(false);



            return;

        }

        // ADMIN users do not need normal user profile setup.
        if (localStorage.getItem("role") === "ADMIN") {
            setIsAdmin(true);
            setProfileSetupRequired(false);
            setSetupSkillsMode(false);
            setCheckingProfile(false);
            setPage("admin");
            return;
        }





        setCheckingProfile(true);





        try {



            console.log(

                "===================================="

            );



            console.log(

                "CHECKING PROFILE COMPLETION"

            );



            console.log(

                "===================================="

            );





            // -------------------------------------------------

            // GET CURRENT USER SKILLS

            // -------------------------------------------------



            const response = await fetch(

                `${API_URL}/api/users/me/skills`,

                {

                    method: "GET",



                    headers: {

                        Authorization:

                            `Bearer ${token}`,



                        "Content-Type":

                            "application/json"

                    }

                }

            );





            // -------------------------------------------------

            // IF REQUEST FAILS

            // -------------------------------------------------



            if (!response.ok) {



                console.error(

                    "PROFILE CHECK FAILED:",

                    response.status

                );



                // Do not block the user if

                // the profile check itself fails.

                setProfileSetupRequired(false);



                return;

            }





            const data =

                await response.json();





            console.log(

                "USER SKILLS:",

                data

            );





            const skills =

                Array.isArray(data)

                    ? data

                    : [];





            // -------------------------------------------------

            // CHECK TEACH SKILL

            // -------------------------------------------------



            const hasTeachSkill =

                skills.some(

                    skill =>

                        skill.type === "TEACH"

                );





            // -------------------------------------------------

            // CHECK LEARN SKILL

            // -------------------------------------------------



            const hasLearnSkill =

                skills.some(

                    skill =>

                        skill.type === "LEARN"

                );





            console.log(

                "HAS TEACH SKILL:",

                hasTeachSkill

            );



            console.log(

                "HAS LEARN SKILL:",

                hasLearnSkill

            );





            // -------------------------------------------------

            // PROFILE INCOMPLETE

            // -------------------------------------------------



            if (

                !hasTeachSkill ||

                !hasLearnSkill

            ) {



                console.log(

                    "PROFILE SETUP REQUIRED"

                );



                setProfileSetupRequired(true);



            } else {



                console.log(

                    "PROFILE IS COMPLETE"

                );



                setProfileSetupRequired(false);
                setSetupSkillsMode(false);

            }



        } catch (error) {



            console.error(

                "PROFILE COMPLETION CHECK ERROR:",

                error

            );



            // Don't block application

            // if checking fails.

            setProfileSetupRequired(false);



        } finally {



            setCheckingProfile(false);

        }

    };





    // =========================================================

    // CHECK PROFILE AFTER LOGIN / PAGE LOAD

    // =========================================================



    useEffect(() => {



        if (loggedIn) {



            checkProfileCompletion();



        } else {



            setProfileSetupRequired(false);

            setCheckingProfile(false);

        }



    }, [loggedIn]);





    // =========================================================

    // =========================================================
    // CHECK SKILLS WHILE USER IS IN SETUP
    // =========================================================

    useEffect(() => {
        if (!profileSetupRequired || !setupSkillsMode) return;

        const interval = setInterval(() => {
            checkProfileCompletion();
        }, 1500);

        return () => clearInterval(interval);
    }, [profileSetupRequired, setupSkillsMode]);


    // =========================================================
    // LOGIN SUCCESS

    // =========================================================



    const handleLogin = (data) => {

        console.log("====================================");
        console.log("LOGIN SUCCESS:");
        console.log(data);
        console.log("====================================");

        const token = data?.token;

        if (token) {
            localStorage.setItem("token", token);
        }

        const userRole =
            data?.role ||
            data?.user?.role ||
            data?.user?.role?.name ||
            localStorage.getItem("role") ||
            "USER";

        localStorage.setItem("role", userRole);

        console.log("USER ROLE:", userRole);

        setIsAdmin(userRole === "ADMIN");
        setLoggedIn(true);
        setAuthPage("login");
        setSelectedChat(null);

        if (userRole === "ADMIN") {
            console.log("ADMIN LOGIN → OPENING ADMIN DASHBOARD");
            setProfileSetupRequired(false);
            setSetupSkillsMode(false);
            setPage("admin");
        } else {
            setPage("dashboard");
        }
    };



    // =========================================================
    // LOGOUT
    // =========================================================


    const handleLogout = () => {



        console.log(

            "LOGGING OUT"

        );





        // -----------------------------------------------------

        // REMOVE AUTH DATA

        // -----------------------------------------------------



        localStorage.removeItem("token");



        localStorage.removeItem("userId");



        localStorage.removeItem("email");



        localStorage.removeItem("role");





        // -----------------------------------------------------

        // RESET APPLICATION STATE

        // -----------------------------------------------------



        setSelectedChat(null);



        setProfileSetupRequired(false);



        setCheckingProfile(false);



        setLoggedIn(false);

        setIsAdmin(false);



        setAuthPage("login");



        setPage("dashboard");

    };





    // =========================================================

    // SHOW REGISTER PAGE

    // =========================================================



    const handleShowRegister = () => {



        console.log(

            "OPEN REGISTER PAGE"

        );



        setAuthPage("register");

    };





    // =========================================================

    // REGISTER COMPLETE

    // =========================================================



    const handleRegisterComplete = () => {



        console.log(

            "REGISTRATION COMPLETED"

        );



        setAuthPage("login");

    };





    // =========================================================

    // SHOW FORGOT PASSWORD PAGE

    // =========================================================



    const handleShowForgotPassword = () => {



        console.log(

            "OPEN FORGOT PASSWORD PAGE"

        );



        setAuthPage("forgot-password");

    };





    // =========================================================

    // BACK TO LOGIN

    // =========================================================



    const handleBackToLogin = () => {



        console.log(

            "BACK TO LOGIN"

        );





        // -----------------------------------------------------

        // FIX RESET PASSWORD URL

        // -----------------------------------------------------



        if (

            window.location.pathname ===

            "/reset-password"

        ) {



            window.history.pushState(

                {},

                "",

                "/"

            );

        }





        setAuthPage("login");

    };





    // =========================================================

    // =========================================================
    // OPEN SKILL MANAGEMENT DURING PROFILE SETUP
    // =========================================================

    const handleManageSetupSkills = () => {
        console.log("OPENING SKILL MANAGEMENT FOR PROFILE SETUP");
        setSetupSkillsMode(true);
    };


    // =========================================================
    // PROFILE SETUP COMPLETE
    // =========================================================

    const handleProfileSetupComplete = () => {



        console.log(

            "PROFILE SETUP COMPLETED"

        );





        setProfileSetupRequired(false);
        setSetupSkillsMode(false);



        setPage("dashboard");





        // Check once again to make sure

        // both skill types exist.

        checkProfileCompletion();

    };





    // =========================================================

    // OPEN CHAT

    // =========================================================



    const handleOpenChat = (

        connectionId,

        otherUser

    ) => {



        console.log(

            "===================================="

        );



        console.log(

            "OPEN CHAT REQUEST"

        );



        console.log(

            "CONNECTION ID:",

            connectionId

        );



        console.log(

            "OTHER USER:",

            otherUser

        );



        console.log(

            "===================================="

        );





        // -----------------------------------------------------

        // CONVERT CONNECTION ID TO NUMBER

        // -----------------------------------------------------



        const numericConnectionId =

            Number(connectionId);





        // -----------------------------------------------------

        // VALIDATE CONNECTION ID

        // -----------------------------------------------------



        if (

            !Number.isInteger(

                numericConnectionId

            ) ||

            numericConnectionId <= 0

        ) {



            console.error(

                "INVALID CONNECTION ID:",

                connectionId

            );



            alert(

                "Unable to open chat: Invalid connection ID"

            );



            return;

        }





        // -----------------------------------------------------

        // VALIDATE OTHER USER

        // -----------------------------------------------------



        if (!otherUser) {



            console.error(

                "OTHER USER IS MISSING"

            );



            alert(

                "Unable to open chat: User information not found"

            );



            return;

        }





        // -----------------------------------------------------

        // CREATE CHAT DATA

        // -----------------------------------------------------



        const chatData = {



            connectionId:

                numericConnectionId,



            userId:

                otherUser.id ??

                otherUser.userId,



            firstName:

                otherUser.firstName ||

                "",



            lastName:

                otherUser.lastName ||

                "",



            email:

                otherUser.email ||

                ""

        };





        console.log(

            "===================================="

        );



        console.log(

            "FINAL CHAT DATA:"

        );



        console.log(

            chatData

        );



        console.log(

            "===================================="

        );





        setSelectedChat(

            chatData

        );

    };





    // =========================================================

    // CLOSE CHAT

    // =========================================================



    const handleCloseChat = () => {



        console.log(

            "CLOSING CHAT"

        );



        setSelectedChat(null);



        setPage("connections");

    };





    // =========================================================

    // RESET PASSWORD PAGE

    // =========================================================



    const isResetPasswordPage =

        window.location.pathname ===

        "/reset-password";





    // =========================================================

    // RESET PASSWORD PAGE

    //

    // IMPORTANT:

    // This check is BEFORE loggedIn.

    // =========================================================



    if (isResetPasswordPage) {



        return (

            <ResetPassword

                onBackToLogin={

                    handleBackToLogin

                }

            />

        );

    }





    // =========================================================

    // UNAUTHENTICATED APPLICATION

    // =========================================================



    if (!loggedIn) {





        // =====================================================

        // REGISTER

        // =====================================================



        if (

            authPage ===

            "register"

        ) {



            return (

                <Register

                    onRegister={

                        handleRegisterComplete

                    }



                    onBackToLogin={

                        handleBackToLogin

                    }

                />

            );

        }





        // =====================================================

        // FORGOT PASSWORD

        // =====================================================



        if (

            authPage ===

            "forgot-password"

        ) {



            return (

                <ForgotPassword

                    onBackToLogin={

                        handleBackToLogin

                    }

                />

            );

        }





        // =====================================================

        // LOGIN

        // =====================================================



        return (

            <Login

                onLogin={

                    handleLogin

                }



                onRegister={

                    handleShowRegister

                }



                onForgotPassword={

                    handleShowForgotPassword

                }

            />

        );

    }





    // =========================================================

    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    if (loggedIn && isAdmin && page === "admin") {
        return (
            <AdminDashboard
                onLogout={handleLogout}
            />
        );
    }


    // PROFILE CHECK LOADING

    // =========================================================



    if (

        checkingProfile &&

        !profileSetupRequired

    ) {



        return (

            <div

                style={{

                    minHeight: "100vh",



                    display: "flex",



                    alignItems: "center",



                    justifyContent: "center",



                    background:

                        "#f8fafc"

                }}

            >



                <div

                    style={{

                        textAlign: "center"

                    }}

                >



                    <div

                        style={{

                            fontSize: "40px",

                            marginBottom: "15px"

                        }}

                    >

                        👋

                    </div>



                    <h2

                        style={{

                            margin: "0 0 8px",

                            color: "#1e293b"

                        }}

                    >

                        Welcome to SkillBridge

                    </h2>



                    <p

                        style={{

                            margin: 0,

                            color: "#64748b"

                        }}

                    >

                        Checking your profile...

                    </p>



                </div>



            </div>

        );

    }





    // =========================================================

    // =========================================================
    // MANDATORY SKILL MANAGEMENT
    // =========================================================

    if (profileSetupRequired && setupSkillsMode) {
        return (
            <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
                <div style={{ minHeight: "70px", padding: "0 25px", background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center" }}>
                    <button
                        type="button"
                        onClick={() => setSetupSkillsMode(false)}
                        style={{ padding: "9px 15px", border: "none", borderRadius: "7px", background: "#2563eb", color: "white", cursor: "pointer", fontWeight: "600" }}
                    >
                        ← Back to Profile Setup
                    </button>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "15px" }}>
                        <span style={{ fontWeight: "700", color: "#2563eb" }}>Complete Your Skills</span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            style={{ padding: "9px 15px", border: "none", borderRadius: "7px", background: "#ef4444", color: "white", cursor: "pointer", fontWeight: "600" }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <SkillManagement />
                </div>
            </div>
        );
    }


    // =========================================================
    // PROFILE SETUP
    // =========================================================

    if (profileSetupRequired) {
        return (
            <ProfileSetup
                onManageSkills={handleManageSetupSkills}
                onComplete={handleProfileSetupComplete}
            />
        );
    }


// CHAT SCREEN

    // =========================================================



    if (selectedChat) {



        return (

            <div

                style={{

                    minHeight: "100vh",



                    background:

                        "#f8fafc"

                }}

            >



                {/* =============================================

                    BACK BUTTON

                ============================================= */}



                <button

                    type="button"



                    onClick={

                        handleCloseChat

                    }



                    style={{

                        position: "fixed",



                        top: "20px",



                        left: "20px",



                        zIndex: 1000,



                        padding:

                            "10px 20px",



                        border: "none",



                        borderRadius:

                            "8px",



                        background:

                            "#2563eb",



                        color: "white",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    ← Back

                </button>





                {/* =============================================

                    LOGOUT BUTTON

                ============================================= */}



                <button

                    type="button"



                    onClick={

                        handleLogout

                    }



                    style={{

                        position: "fixed",



                        top: "20px",



                        right: "20px",



                        zIndex: 1000,



                        padding:

                            "10px 20px",



                        border: "none",



                        borderRadius:

                            "8px",



                        background:

                            "#ef4444",



                        color: "white",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    Logout

                </button>





                {/* =============================================

                    CHAT

                ============================================= */}



                <Chat



                    connectionId={

                        selectedChat

                            .connectionId

                    }



                    otherUser={{



                        id:

                            selectedChat

                                .userId,



                        userId:

                            selectedChat

                                .userId,



                        firstName:

                            selectedChat

                                .firstName,



                        lastName:

                            selectedChat

                                .lastName,



                        email:

                            selectedChat

                                .email

                    }}



                    onClose={

                        handleCloseChat

                    }



                />



            </div>

        );

    }





    // =========================================================

    // PROFILE PAGE

    // =========================================================



    if (

        page === "profile"

    ) {



        return (

            <div

                style={{

                    minHeight: "100vh",



                    background:

                        "#f8fafc",



                    display:

                        "flex",



                    flexDirection:

                        "column"

                }}

            >



                {/* =============================================

                    PROFILE TOP BAR

                ============================================= */}



                <div

                    style={{

                        height: "70px",



                        padding:

                            "0 25px",



                        background:

                            "white",



                        borderBottom:

                            "1px solid #e2e8f0",



                        display:

                            "flex",



                        alignItems:

                            "center"

                    }}

                >



                    <button

                        type="button"



                        onClick={() =>

                            setPage(

                                "dashboard"

                            )

                        }



                        style={{

                            padding:

                                "9px 15px",



                            border: "none",



                            borderRadius:

                                "7px",



                            background:

                                "#2563eb",



                            color:

                                "white",



                            cursor:

                                "pointer",



                            fontWeight:

                                "600"

                        }}

                    >

                        ← Back

                    </button>





                    <button

                        type="button"



                        onClick={

                            handleLogout

                        }



                        style={{

                            marginLeft:

                                "auto",



                            padding:

                                "9px 15px",



                            border:

                                "none",



                            borderRadius:

                                "7px",



                            background:

                                "#ef4444",



                            color:

                                "white",



                            cursor:

                                "pointer",



                            fontWeight:

                                "600"

                        }}

                    >

                        Logout

                    </button>



                </div>





                {/* =============================================

                    PROFILE

                ============================================= */}



                <div

                    style={{

                        flex: 1

                    }}

                >



                    <Profile

                        onManageSkills={() =>

                            setPage("skills")

                        }

                    />



                </div>





                {/* =============================================

                    FOOTER

                ============================================= */}



                <Footer

                    onNavigate={(targetPage) => {

                        setPage(targetPage);

                    }}

                />



            </div>

        );

    }





    // =========================================================

    // SKILLS PAGE

    // =========================================================



    if (

        page === "skills"

    ) {



        return (

            <div

                style={{

                    minHeight: "100vh",



                    background:

                        "#f8fafc",



                    display:

                        "flex",



                    flexDirection:

                        "column"

                }}

            >



                {/* =============================================

                    SKILLS TOP BAR

                ============================================= */}



                <div

                    style={{

                        height: "70px",



                        padding:

                            "0 25px",



                        background:

                            "white",



                        borderBottom:

                            "1px solid #e2e8f0",



                        display:

                            "flex",



                        alignItems:

                            "center"

                    }}

                >



                    <button

                        type="button"



                        onClick={() =>

                            setPage(

                                "profile"

                            )

                        }



                        style={{

                            padding:

                                "9px 15px",



                            border:

                                "none",



                            borderRadius:

                                "7px",



                            background:

                                "#2563eb",



                            color:

                                "white",



                            cursor:

                                "pointer",



                            fontWeight:

                                "600"

                        }}

                    >

                        ← Back

                    </button>





                    <button

                        type="button"



                        onClick={

                            handleLogout

                        }



                        style={{

                            marginLeft:

                                "auto",



                            padding:

                                "9px 15px",



                            border:

                                "none",



                            borderRadius:

                                "7px",



                            background:

                                "#ef4444",



                            color:

                                "white",



                            cursor:

                                "pointer",



                            fontWeight:

                                "600"

                        }}

                    >

                        Logout

                    </button>



                </div>





                {/* =============================================

                    SKILL MANAGEMENT

                ============================================= */}



                <div

                    style={{

                        flex: 1

                    }}

                >



                    <SkillManagement />



                </div>





                {/* =============================================

                    FOOTER

                ============================================= */}



                <Footer

                    onNavigate={(targetPage) => {

                        setPage(targetPage);

                    }}

                />



            </div>

        );

    }





    // =========================================================

    // MAIN APPLICATION

    // =========================================================



    return (

        <div

            style={{

                minHeight: "100vh",



                background:

                    "#f8fafc",



                display:

                    "flex",



                flexDirection:

                    "column"

            }}

        >



            {/* =================================================

                NAVIGATION BAR

            ================================================= */}



            <div

                style={{

                    minHeight:

                        "70px",



                    padding:

                        "0 25px",



                    background:

                        "white",



                    borderBottom:

                        "1px solid #e2e8f0",



                    display:

                        "flex",



                    alignItems:

                        "center",



                    gap:

                        "8px",



                    position:

                        "sticky",



                    top:

                        0,



                    zIndex:

                        100,



                    flexWrap:

                        "wrap"

                }}

            >



                {/* =============================================

                    LOGO

                ============================================= */}



                <div

                    style={{

                        fontSize:

                            "22px",



                        fontWeight:

                            "700",



                        color:

                            "#2563eb",



                        marginRight:

                            "15px"

                    }}

                >

                    SkillBridge

                </div>





                {/* =============================================

                    DASHBOARD

                ============================================= */}



                <button

                    type="button"



                    onClick={() =>

                        setPage(

                            "dashboard"

                        )

                    }



                    style={{

                        padding:

                            "9px 14px",



                        border:

                            "none",



                        borderRadius:

                            "7px",



                        background:

                            page ===

                            "dashboard"



                                ? "#dbeafe"



                                : "transparent",



                        color:

                            "#1e40af",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    Dashboard

                </button>





                {/* =============================================

                    MATCHES

                ============================================= */}



                <button

                    type="button"



                    onClick={() =>

                        setPage(

                            "matches"

                        )

                    }



                    style={{

                        padding:

                            "9px 14px",



                        border:

                            "none",



                        borderRadius:

                            "7px",



                        background:

                            page ===

                            "matches"



                                ? "#dbeafe"



                                : "transparent",



                        color:

                            "#1e40af",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    Matches

                </button>





                {/* =============================================

                    DISCOVER USERS

                ============================================= */}



                <button

                    type="button"



                    onClick={() =>

                        setPage(

                            "discover"

                        )

                    }



                    style={{

                        padding:

                            "9px 14px",



                        border:

                            "none",



                        borderRadius:

                            "7px",



                        background:

                            page ===

                            "discover"



                                ? "#dbeafe"



                                : "transparent",



                        color:

                            "#1e40af",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    Discover Users

                </button>





                {/* =============================================

                    MY CONNECTIONS

                ============================================= */}



                <button

                    type="button"



                    onClick={() =>

                        setPage(

                            "connections"

                        )

                    }



                    style={{

                        padding:

                            "9px 14px",



                        border:

                            "none",



                        borderRadius:

                            "7px",



                        background:

                            page ===

                            "connections"



                                ? "#dbeafe"



                                : "transparent",



                        color:

                            "#1e40af",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    My Connections

                </button>





                {/* =============================================

                    REQUESTS

                ============================================= */}



                <button

                    type="button"



                    onClick={() =>

                        setPage(

                            "requests"

                        )

                    }



                    style={{

                        padding:

                            "9px 14px",



                        border:

                            "none",



                        borderRadius:

                            "7px",



                        background:

                            page ===

                            "requests"



                                ? "#dbeafe"



                                : "transparent",



                        color:

                            "#1e40af",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    Requests

                </button>





                {/* =============================================

                    PROFILE

                ============================================= */}



                <button

                    type="button"



                    onClick={() =>

                        setPage(

                            "profile"

                        )

                    }



                    style={{

                        padding:

                            "9px 14px",



                        border:

                            "none",



                        borderRadius:

                            "7px",



                        background:

                            page ===

                            "profile"



                                ? "#dbeafe"



                                : "transparent",



                        color:

                            "#1e40af",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    Profile

                </button>





                {/* =============================================

                    NOTIFICATION BELL

                ============================================= */}



                <div

                    style={{

                        marginLeft:

                            "auto"

                    }}

                >



                    <NotificationBell />



                </div>





                {/* =============================================

                    LOGOUT

                ============================================= */}



                <button

                    type="button"



                    onClick={

                        handleLogout

                    }



                    style={{

                        padding:

                            "9px 15px",



                        border:

                            "none",



                        borderRadius:

                            "7px",



                        background:

                            "#ef4444",



                        color:

                            "white",



                        cursor:

                            "pointer",



                        fontWeight:

                            "600"

                    }}

                >

                    Logout

                </button>



            </div>





            {/* =================================================

                PAGE CONTENT

            ================================================= */}



            <div

                style={{

                    flex: 1

                }}

            >



                {/* =============================================

                    DASHBOARD

                ============================================= */}



                {page === "dashboard" && (



                    <Dashboard



                        onNavigate={

                            (targetPage) => {



                                console.log(

                                    "DASHBOARD NAVIGATION:",

                                    targetPage

                                );



                                setPage(

                                    targetPage

                                );

                            }

                        }



                    />



                )}





                {/* =============================================

                    DISCOVER USERS

                ============================================= */}



                {page === "discover" && (



                    <DiscoverUsers />



                )}





                {/* =============================================

                    CONNECTIONS

                ============================================= */}



                {page === "connections" && (



                    <Connections



                        onOpenChat={

                            handleOpenChat

                        }



                    />



                )}





                {/* =============================================

                    REQUESTS

                ============================================= */}



                {page === "requests" && (



                    <ConnectionRequests />



                )}





                {/* =============================================

                    MATCHES

                ============================================= */}



                {page === "matches" && (



                    <Matches />



                )}



            </div>





            {/* =================================================

                FOOTER

            ================================================= */}



            <Footer



                onNavigate={

                    (targetPage) => {



                        setPage(

                            targetPage

                        );

                    }

                }



            />



        </div>

    );

}





// =========================================================

// EXPORT

// =========================================================



export default App;