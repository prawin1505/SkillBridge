import { useEffect, useState } from "react";
import "./SkillManagement.css";

import API_URL from "../config";

// ==========================
// AVAILABLE SKILLS
// ==========================

const AVAILABLE_SKILLS = [
    "Java",
    "Python",
    "JavaScript",
    "React",
    "Spring Boot",
    "HTML",
    "CSS",
    "SQL",
    "PostgreSQL",
    "Django",
    "Figma",
    "UI/UX Design",
    "Node.js",
    "Express.js",
    "MongoDB",
    "MySQL",
    "Git & GitHub",
    "AWS",
    "Docker",
    "C",
    "C++",
    "Data Structures",
    "Machine Learning",
    "Artificial Intelligence",
    "Data Science"
];


function SkillManagement() {

    // ==========================
    // STATE
    // ==========================

    const [mySkills, setMySkills] = useState([]);

    const [selectedSkill, setSelectedSkill] =
        useState("");

    const [skillType, setSkillType] =
        useState("TEACH");

    const [level, setLevel] =
        useState("BEGINNER");

    const [loading, setLoading] =
        useState(true);

    const [adding, setAdding] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const token =
        localStorage.getItem("token");


    // ==========================
    // LOAD USER SKILLS
    // ==========================

    useEffect(() => {

        loadSkills();

    }, []);


    const loadSkills = async () => {

        try {

            const response = await fetch(
                `${API_URL}/api/users/me/skills`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load your skills"
                );

            }


            const data =
                await response.json();


            console.log(
                "MY SKILLS:",
                data
            );


            setMySkills(data);


        } catch (error) {

            console.error(
                "LOAD SKILLS ERROR:",
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
    // ADD SKILL
    // ==========================

    const handleAddSkill = async (e) => {

        e.preventDefault();


        setError("");
        setSuccess("");


        // ==========================
        // VALIDATE
        // ==========================

        if (!selectedSkill) {

            setError(
                "Please select a skill"
            );

            return;
        }


        try {

            setAdding(true);


            // ==========================
            // GET SKILLS FROM BACKEND
            // ==========================

            const skillsResponse =
                await fetch(
                    `${API_URL}/api/skills`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            console.log(
                "SKILLS API STATUS:",
                skillsResponse.status
            );


            if (!skillsResponse.ok) {

                throw new Error(
                    "Unable to load skill information"
                );

            }


            const skills =
                await skillsResponse.json();


            console.log(
                "ALL BACKEND SKILLS:",
                skills
            );


            // ==========================
            // FIND SELECTED SKILL
            // ==========================

            const skill =
                skills.find(
                    item =>
                        item.name &&
                        item.name.toLowerCase() ===
                        selectedSkill.toLowerCase()
                );


            // ==========================
            // SKILL NOT FOUND
            // ==========================

            if (!skill) {

                throw new Error(
                    `${selectedSkill} is not available in the database`
                );

            }


            console.log(
                "SELECTED SKILL:",
                skill
            );


            // ==========================
            // CHECK DUPLICATE
            // ==========================

            const alreadyExists =
                mySkills.some(
                    userSkill =>
                        userSkill.skill?.id === skill.id &&
                        userSkill.type === skillType
                );


            if (alreadyExists) {

                throw new Error(
                    `${selectedSkill} is already added as ${skillType === "TEACH"
                        ? "a teaching skill"
                        : "a learning skill"}`
                );

            }


            // ==========================
            // ADD USER SKILL
            // ==========================

            const response =
                await fetch(
                    `${API_URL}/api/users/me/skills`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            skillId:
                                skill.id,

                            type:
                                skillType,

                            level:
                                level

                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "ADD SKILL RESPONSE:",
                data
            );


            // ==========================
            // HANDLE ERROR
            // ==========================

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Failed to add skill"
                );

            }


            // ==========================
            // SUCCESS
            // ==========================

            setSuccess(
                `${selectedSkill} added successfully!`
            );


            setSelectedSkill("");


            // Reload skills

            await loadSkills();


        } catch (error) {

            console.error(
                "ADD SKILL ERROR:",
                error
            );


            setError(
                error.message
            );

        } finally {

            setAdding(false);

        }

    };


    // ==========================
    // DELETE SKILL
    // ==========================

    const handleDeleteSkill =
        async (id) => {


            const confirmDelete =
                window.confirm(
                    "Are you sure you want to remove this skill?"
                );


            if (!confirmDelete) {

                return;

            }


            try {

                setError("");
                setSuccess("");


                const response =
                    await fetch(
                        `${API_URL}/api/users/me/skills/${id}`,
                        {
                            method: "DELETE",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const message =
                    await response.text();


                console.log(
                    "DELETE RESPONSE:",
                    message
                );


                if (!response.ok) {

                    throw new Error(
                        message ||
                        "Failed to remove skill"
                    );

                }


                setSuccess(
                    "Skill removed successfully!"
                );


                await loadSkills();


            } catch (error) {

                console.error(
                    "DELETE SKILL ERROR:",
                    error
                );


                setError(
                    error.message
                );

            }

        };


    // ==========================
    // GET SKILL NAME
    // ==========================

    const getSkillName =
        (userSkill) => {

            return (
                userSkill.skill?.name ||
                userSkill.skillName ||
                userSkill.name ||
                "Unknown Skill"
            );

        };


    // ==========================
    // LOADING
    // ==========================

    if (loading) {

        return (
            <div className="skill-management-loading">

                Loading skills...

            </div>
        );

    }


    // ==========================
    // UI
    // ==========================

    return (

        <div className="skill-management-page">


            {/* ==========================
                HEADER
            ========================== */}

            <div className="skill-management-header">

                <div>

                    <p className="skill-management-label">
                        SKILL MANAGEMENT
                    </p>


                    <h1>
                        Manage Your Skills
                    </h1>


                    <p>
                        Add the skills you can teach
                        and the skills you want to learn.
                    </p>

                </div>


                <div className="skill-header-icon">
                    💡
                </div>

            </div>


            {/* ==========================
                ERROR
            ========================== */}

            {error && (

                <div className="skill-error">

                    {error}

                </div>

            )}


            {/* ==========================
                SUCCESS
            ========================== */}

            {success && (

                <div className="skill-success">

                    {success}

                </div>

            )}


            {/* ==========================
                ADD SKILL CARD
            ========================== */}

            <div className="add-skill-card">


                <div className="card-title">

                    <div>

                        <h2>
                            Add a Skill
                        </h2>


                        <p>
                            Choose a skill, type and
                            experience level.
                        </p>

                    </div>


                    <span>
                        ➕
                    </span>

                </div>


                <form
                    onSubmit={handleAddSkill}
                >


                    <div className="skill-form-grid">


                        {/* ==========================
                            SKILL DROPDOWN
                        ========================== */}

                        <div className="skill-form-group">

                            <label>
                                Skill
                            </label>


                            <select
                                value={selectedSkill}
                                onChange={(e) =>
                                    setSelectedSkill(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select a skill
                                </option>


                                {AVAILABLE_SKILLS.map(
                                    (skill) => (

                                        <option
                                            key={skill}
                                            value={skill}
                                        >
                                            {skill}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* ==========================
                            SKILL TYPE
                        ========================== */}

                        <div className="skill-form-group">

                            <label>
                                Skill Type
                            </label>


                            <select
                                value={skillType}
                                onChange={(e) =>
                                    setSkillType(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="TEACH">
                                    I Can Teach
                                </option>


                                <option value="LEARN">
                                    I Want to Learn
                                </option>

                            </select>

                        </div>


                        {/* ==========================
                            LEVEL
                        ========================== */}

                        <div className="skill-form-group">

                            <label>
                                Level
                            </label>


                            <select
                                value={level}
                                onChange={(e) =>
                                    setLevel(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="BEGINNER">
                                    Beginner
                                </option>


                                <option value="INTERMEDIATE">
                                    Intermediate
                                </option>


                                <option value="ADVANCED">
                                    Advanced
                                </option>


                                <option value="EXPERT">
                                    Expert
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* ==========================
                        ADD BUTTON
                    ========================== */}

                    <button
                        type="submit"
                        className="add-skill-button"
                        disabled={adding}
                    >

                        {adding
                            ? "Adding..."
                            : "Add Skill"}

                    </button>

                </form>

            </div>


            {/* ==========================
                MY SKILLS
            ========================== */}

            <div className="my-skills-section">


                <div className="my-skills-title">

                    <div>

                        <h2>
                            My Skills
                        </h2>


                        <p>
                            Skills currently associated
                            with your profile.
                        </p>

                    </div>


                    <span>
                        {mySkills.length}
                    </span>

                </div>


                {/* ==========================
                    NO SKILLS
                ========================== */}

                {mySkills.length === 0 ? (

                    <div className="no-user-skills">

                        <div>
                            🧩
                        </div>


                        <h3>
                            No skills added yet
                        </h3>


                        <p>
                            Add your first skill
                            using the form above.
                        </p>

                    </div>

                ) : (


                    /* ==========================
                       SKILL CARDS
                    ========================== */

                    <div className="user-skill-grid">

                        {mySkills.map(
                            (userSkill) => (

                                <div
                                    className="user-skill-card"
                                    key={
                                        userSkill.id
                                    }
                                >


                                    {/* ICON */}

                                    <div
                                        className="user-skill-icon"
                                    >

                                        {userSkill.type ===
                                        "TEACH"
                                            ? "💡"
                                            : "📚"}

                                    </div>


                                    {/* CONTENT */}

                                    <div
                                        className="user-skill-content"
                                    >

                                        <h3>
                                            {getSkillName(
                                                userSkill
                                            )}
                                        </h3>


                                        <span
                                            className={
                                                userSkill.type ===
                                                "TEACH"
                                                    ? "skill-type teach"
                                                    : "skill-type learn"
                                            }
                                        >

                                            {userSkill.type ===
                                            "TEACH"
                                                ? "Can Teach"
                                                : "Want to Learn"}

                                        </span>


                                        <p>

                                            Level:{" "}

                                            {userSkill.level ||
                                                "Not specified"}

                                        </p>

                                    </div>


                                    {/* DELETE */}

                                    <button
                                        className="delete-skill-button"
                                        onClick={() =>
                                            handleDeleteSkill(
                                                userSkill.id
                                            )
                                        }
                                        title="Remove skill"
                                    >
                                        ×
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    );
}


export default SkillManagement;