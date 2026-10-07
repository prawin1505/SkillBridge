import { useEffect, useState } from "react";
import "./ProfileSetup.css";

import API_URL from "../config";

function ProfileSetup({ onManageSkills, onComplete }) {
    const [profile, setProfile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        setError("");

        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            };

            const profileResponse = await fetch(
                `${API_URL}/api/users/me`,
                {
                    method: "GET",
                    headers
                }
            );

            if (!profileResponse.ok) {
                throw new Error("Unable to load profile");
            }

            const profileData = await profileResponse.json();

            const skillsResponse = await fetch(
                `${API_URL}/api/users/me/skills`,
                {
                    method: "GET",
                    headers
                }
            );

            if (!skillsResponse.ok) {
                throw new Error("Unable to load skills");
            }

            const skillsData = await skillsResponse.json();

            setProfile(profileData);
            setSkills(Array.isArray(skillsData) ? skillsData : []);

        } catch (err) {
            setError(err.message || "Unable to load profile");
        } finally {
            setLoading(false);
        }
    };

    const teachSkills = skills.filter(
        skill => skill.type === "TEACH"
    );

    const learnSkills = skills.filter(
        skill => skill.type === "LEARN"
    );

    const hasTeachSkill = teachSkills.length > 0;
    const hasLearnSkill = learnSkills.length > 0;

    const basicInfoComplete =
        profile &&
        profile.firstName &&
        profile.lastName;

    const isComplete =
        basicInfoComplete &&
        hasTeachSkill &&
        hasLearnSkill;

    const completionPercentage =
        !basicInfoComplete
            ? 0
            : hasTeachSkill && hasLearnSkill
                ? 100
                : 50;

    const handleButtonClick = () => {
        setError("");

        if (isComplete) {
            if (onComplete) {
                onComplete();
            }
            return;
        }

        if (onManageSkills) {
            onManageSkills();
        } else {
            setError("Unable to open Skill Management.");
        }
    };

    if (loading) {
        return (
            <div className="profile-setup-page">
                <div className="profile-setup-card">
                    <div className="profile-setup-icon">⏳</div>
                    <h2>Loading your profile...</h2>
                    <p>Please wait.</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-setup-page">
                <div className="profile-setup-card">
                    <div className="profile-setup-icon">⚠️</div>

                    <h2>Unable to load profile</h2>

                    <p className="profile-setup-error">
                        {error || "Something went wrong."}
                    </p>

                    <button
                        className="profile-setup-primary"
                        onClick={loadProfile}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-setup-page">

            <div className="profile-setup-card">

                <div className="profile-setup-icon">
                    👋
                </div>

                <h1>Welcome to SkillBridge</h1>

                <p className="profile-setup-subtitle">
                    Hi{" "}
                    <strong>
                        {profile.firstName} {profile.lastName}
                    </strong>
                    ! Let's complete your profile before you start
                    connecting with other learners.
                </p>

                <div className="profile-progress">

                    <div className="progress-header">
                        <span>Profile Completion</span>
                        <span>{completionPercentage}%</span>
                    </div>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${completionPercentage}%`
                            }}
                        />
                    </div>

                </div>

                <div className="setup-checklist">

                    <div
                        className={`setup-item ${
                            basicInfoComplete
                                ? "complete"
                                : "incomplete"
                        }`}
                    >
                        <div className="setup-status">
                            {basicInfoComplete ? "✓" : "○"}
                        </div>

                        <div>
                            <strong>Basic Information</strong>

                            <span>
                                {basicInfoComplete
                                    ? `${profile.firstName} ${profile.lastName}`
                                    : "Add your name"}
                            </span>
                        </div>
                    </div>

                    <div
                        className={`setup-item ${
                            hasTeachSkill
                                ? "complete"
                                : "incomplete"
                        }`}
                    >
                        <div className="setup-status">
                            {hasTeachSkill ? "✓" : "○"}
                        </div>

                        <div>
                            <strong>
                                Skills You Can Teach
                            </strong>

                            <span>
                                {hasTeachSkill
                                    ? `${teachSkills.length} skill${
                                        teachSkills.length > 1
                                            ? "s"
                                            : ""
                                    } added`
                                    : "Add at least one skill"}
                            </span>
                        </div>
                    </div>

                    <div
                        className={`setup-item ${
                            hasLearnSkill
                                ? "complete"
                                : "incomplete"
                        }`}
                    >
                        <div className="setup-status">
                            {hasLearnSkill ? "✓" : "○"}
                        </div>

                        <div>
                            <strong>
                                Skills You Want to Learn
                            </strong>

                            <span>
                                {hasLearnSkill
                                    ? `${learnSkills.length} skill${
                                        learnSkills.length > 1
                                            ? "s"
                                            : ""
                                    } added`
                                    : "Add at least one skill"}
                            </span>
                        </div>
                    </div>

                </div>

                {error && (
                    <div className="profile-setup-error">
                        {error}
                    </div>
                )}

                <button
                    className="profile-setup-primary"
                    onClick={handleButtonClick}
                >
                    {isComplete
                        ? "Continue to SkillBridge"
                        : "Add Skills to Continue"}
                </button>

                <p className="profile-setup-note">
                    {isComplete
                        ? "Your profile is ready. Start connecting with other learners!"
                        : "Add at least one skill you can teach and one skill you want to learn."}
                </p>

            </div>

        </div>
    );
}

export default ProfileSetup;
