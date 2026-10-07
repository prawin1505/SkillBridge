import { useEffect, useState } from "react";
import "./Profile.css";

import API_URL from "../config";

function Profile({ onManageSkills }) {

    const [user, setUser] = useState(null);

    const [teachingSkills, setTeachingSkills] = useState([]);
    const [learningSkills, setLearningSkills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");


    // ==========================
    // LOAD PROFILE
    // ==========================

    useEffect(() => {
        loadProfile();
    }, []);


    const loadProfile = async () => {

        try {

            // ==========================
            // USER
            // ==========================

            const userResponse = await fetch(
                `${API_URL}/api/users/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!userResponse.ok) {
                throw new Error(
                    "Failed to load profile"
                );
            }

            const userData =
                await userResponse.json();

            setUser(userData);


            // ==========================
            // USER SKILLS
            // ==========================

            const skillResponse = await fetch(
                `${API_URL}/api/users/me/skills`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!skillResponse.ok) {
                throw new Error(
                    "Failed to load skills"
                );
            }

            const skills =
                await skillResponse.json();


            // ==========================
            // TEACHING SKILLS
            // ==========================

            setTeachingSkills(
                skills.filter(
                    skill =>
                        skill.type === "TEACH"
                )
            );


            // ==========================
            // LEARNING SKILLS
            // ==========================

            setLearningSkills(
                skills.filter(
                    skill =>
                        skill.type === "LEARN"
                )
            );

        } catch (error) {

            console.error(
                "PROFILE ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================
    // GET SKILL NAME
    // ==========================

    const getSkillName = (skill) => {

        return (
            skill.skill?.name ||
            skill.skillName ||
            skill.name ||
            "Unknown Skill"
        );
    };


    // ==========================
    // LOADING
    // ==========================

    if (loading) {

        return (
            <div className="profile-loading">
                Loading profile...
            </div>
        );
    }


    // ==========================
    // ERROR
    // ==========================

    if (error) {

        return (
            <div className="profile-error">
                {error}
            </div>
        );
    }


    return (

        <div className="profile-page">

            {/* ==========================
                PROFILE HEADER
            ========================== */}

            <div className="profile-header">

                <div className="profile-avatar">
                    {user?.firstName
                        ?.charAt(0)
                        .toUpperCase()}
                </div>


                <div className="profile-user-info">

                    <h1>
                        {user?.firstName}{" "}
                        {user?.lastName}
                    </h1>

                    <p>
                        {user?.email}
                    </p>

                </div>


                {/* ==========================
                    MANAGE SKILLS BUTTON
                ========================== */}

                <button
                    className="manage-skills-button"
                    onClick={onManageSkills}
                >
                    ⚙️ Manage Skills
                </button>

            </div>


            {/* ==========================
                PROFILE INFORMATION
            ========================== */}

            <div className="profile-section">

                <h2>
                    Profile Information
                </h2>


                <div className="profile-info-grid">

                    <div className="profile-info-card">

                        <span>
                            First Name
                        </span>

                        <strong>
                            {user?.firstName || "-"}
                        </strong>

                    </div>


                    <div className="profile-info-card">

                        <span>
                            Last Name
                        </span>

                        <strong>
                            {user?.lastName || "-"}
                        </strong>

                    </div>


                    <div className="profile-info-card">

                        <span>
                            Email
                        </span>

                        <strong>
                            {user?.email || "-"}
                        </strong>

                    </div>


                    <div className="profile-info-card">

                        <span>
                            Role
                        </span>

                        <strong>
                            {user?.role || "USER"}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==========================
                SKILLS
            ========================== */}

            <div className="skills-section">

                {/* ==========================
                    TEACHING
                ========================== */}

                <div className="skills-card">

                    <div className="skills-card-header">

                        <div>

                            <h2>
                                Skills I Can Teach
                            </h2>

                            <p>
                                Skills you can share
                                with other users
                            </p>

                        </div>

                        <span>
                            💡
                        </span>

                    </div>


                    <div className="skill-list">

                        {teachingSkills.length === 0 ? (

                            <p className="no-skills">
                                No teaching skills
                                added yet.
                            </p>

                        ) : (

                            teachingSkills.map(
                                (skill, index) => (

                                    <span
                                        className="skill-tag teach"
                                        key={
                                            skill.id ||
                                            index
                                        }
                                    >
                                        {getSkillName(
                                            skill
                                        )}
                                    </span>

                                )
                            )

                        )}

                    </div>

                </div>


                {/* ==========================
                    LEARNING
                ========================== */}

                <div className="skills-card">

                    <div className="skills-card-header">

                        <div>

                            <h2>
                                Skills I Want to Learn
                            </h2>

                            <p>
                                Skills you want to
                                learn from others
                            </p>

                        </div>

                        <span>
                            📚
                        </span>

                    </div>


                    <div className="skill-list">

                        {learningSkills.length === 0 ? (

                            <p className="no-skills">
                                No learning skills
                                added yet.
                            </p>

                        ) : (

                            learningSkills.map(
                                (skill, index) => (

                                    <span
                                        className="skill-tag learn"
                                        key={
                                            skill.id ||
                                            index
                                        }
                                    >
                                        {getSkillName(
                                            skill
                                        )}
                                    </span>

                                )
                            )

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Profile;