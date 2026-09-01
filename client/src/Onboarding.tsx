import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { api } from "./services/api";

const Logo = () => (
  <div className="logo">
    <span className="logo-mark">
      <i className="bi bi-stars" aria-hidden="true" />
    </span>
    <span>AIveda</span>
  </div>
);

type OnboardingData = {
  goal: string;
  occupation: string;
  education: string;
  experience: string;
  skills: Array<{ name: string; proficiency: number }>;
  hoursPerWeek: number;
  learningStyle: string;
  resourceType: string;
  difficulty: string;
};

const ALL_SKILLS = [
  "JavaScript",
  "TypeScript",
  "HTML/CSS",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring",
  "SQL",
  "MongoDB",
  "Git",
  "Docker",
  "AWS",
  "Azure",
  "GCP",
  "DevOps",
  "Figma",
];

export default function Onboarding({
  onComplete,
  dark,
  setDark,
}: {
  onComplete: () => void;
  dark: boolean;
  setDark: (value: boolean | ((current: boolean) => boolean)) => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<OnboardingData>({
    goal: "I want to become a full-stack developer and build products people use.",
    occupation: "",
    education: "Self-taught",
    experience: "Beginner",
    skills: [],
    hoursPerWeek: 6,
    learningStyle: "Hands-on projects",
    resourceType: "Video + docs",
    difficulty: "Challenging",
  });
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const toggleSkill = (skillName: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skillName)) {
      newSelected.delete(skillName);
    } else {
      newSelected.add(skillName);
    }
    setSelectedSkills(newSelected);
  };

  const saveAndContinue = async () => {
    if (step === 1) {
      if (!data.goal.trim()) {
        setError("Please tell us your goal.");
        return;
      }
      setStep(2);
      setError("");
    } else if (step === 2) {
      if (!data.occupation.trim()) {
        setError("Please tell us your current occupation or role.");
        return;
      }
      setStep(3);
      setError("");
    } else if (step === 3) {
      setLoading(true);
      setError("");
      try {
        const skillsArray = Array.from(selectedSkills).map((name) => ({
          name,
          proficiency: 50,
        }));
        await api.updateProfile({
          occupation: data.occupation,
          education: data.education,
          experience: data.experience,
          skills: skillsArray,
          preferences: {
            hoursPerWeek: data.hoursPerWeek,
            learningStyle: data.learningStyle,
            resourceType: data.resourceType,
            difficulty: data.difficulty,
          },
        });
        await api.createGoal(data.goal);
        await api.generatePath();
        onComplete();
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Could not complete onboarding.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={dark ? "onboarding-page dark" : "onboarding-page"}>
      <header>
        <Logo />
        <div className="header-actions">
          <button
            className="landing-theme-toggle onboarding-theme-toggle"
            onClick={() => setDark((current: boolean) => !current)}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? "☀" : "☾"}
          </button>
          <span>Step {step} of 3</span>
        </div>
      </header>
      <div className="onboarding-progress">
        <span style={{ width: step * 33.33 + "%" }} />
      </div>
      <main className="onboarding-card">
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            <span className="eyebrow">Let's get oriented</span>
            <h1>What are you working toward?</h1>
            <p>
              Your goal can be ambitious, specific, or still taking shape. Write
              it like you would say it.
            </p>
            <textarea
              value={data.goal}
              onChange={(e) => setData({ ...data, goal: e.target.value })}
              rows={4}
              placeholder="e.g., Become a full-stack developer, Learn AI and machine learning, etc."
            />
            <div className="prompt-chips">
              <button
                onClick={() =>
                  setData({
                    ...data,
                    goal: "I want to become a machine learning engineer and get an internship within 8 months.",
                  })
                }
              >
                Machine learning engineer
              </button>
              <button
                onClick={() =>
                  setData({
                    ...data,
                    goal: "I want to become a cloud engineer and pass my first certification.",
                  })
                }
              >
                Cloud engineer
              </button>
              <button
                onClick={() =>
                  setData({
                    ...data,
                    goal: "I want to become a full-stack developer and build products people use.",
                  })
                }
              >
                Full-stack developer
              </button>
              <button
                onClick={() =>
                  setData({
                    ...data,
                    goal: "I want to become a data analyst and learn how to turn data into decisions.",
                  })
                }
              >
                Data analyst
              </button>
              <button
                onClick={() =>
                  setData({
                    ...data,
                    goal: "I want to become a product designer and create intuitive digital experiences.",
                  })
                }
              >
                Product designer
              </button>
              <button
                onClick={() =>
                  setData({
                    ...data,
                    goal: "I want to become a cybersecurity analyst and build a strong foundation in security.",
                  })
                }
              >
                Cybersecurity analyst
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <span className="eyebrow">Your starting point</span>
            <h1>Tell us about yourself</h1>
            <p>
              We use this to make your path relevant and validate your progress.
            </p>

            <label className="onboarding-field" style={{ marginTop: "20px" }}>
              <span>Current occupation or role *</span>
              <select
                value={data.occupation}
                onChange={(e) =>
                  setData({ ...data, occupation: e.target.value })
                }
              >
                <option value="">Select your role</option>
                <option value="Student">Student</option>
                <option value="Working professional">
                  Working professional
                </option>
                <option value="Product Manager">Product Manager</option>
                <option value="Designer">Designer</option>
                <option value="Teacher">Teacher</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="onboarding-field">
              <span>Education background</span>
              <select
                value={data.education}
                onChange={(e) =>
                  setData({ ...data, education: e.target.value })
                }
              >
                <option value="Self-taught">Self-taught</option>
                <option value="High school diploma">High school diploma</option>
                <option value="Bachelor's degree">Bachelor's degree</option>
                <option value="Master's degree">Master's degree</option>
                <option value="College student">College student</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <div className="onboarding-field" style={{ marginTop: "20px" }}>
              <label style={{ display: "block", marginBottom: "12px" }}>
                Current experience level
              </label>
              <div className="preference-grid">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    className={data.experience === level ? "selected" : ""}
                    onClick={() => setData({ ...data, experience: level })}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
              Which skills do you already have?
            </h3>
            <div className="onboarding-skills">
              {ALL_SKILLS.map((skill) => (
                <button
                  key={skill}
                  className={selectedSkills.has(skill) ? "selected" : ""}
                  onClick={() => toggleSkill(skill)}
                >
                  {selectedSkills.has(skill) && <Check size={14} />}
                  {skill}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <span className="eyebrow">Make it sustainable</span>
            <h1>How do you like to learn?</h1>
            <p>We will tune your weekly plan around your actual life.</p>

            <div style={{ marginTop: "25px" }}>
              <label style={{ display: "block", marginBottom: "15px" }}>
                How many hours per week can you dedicate?
              </label>
              <div className="preference-grid">
                {[4, 6, 10].map((value) => (
                  <button
                    key={value}
                    className={data.hoursPerWeek === value ? "selected" : ""}
                    onClick={() => setData({ ...data, hoursPerWeek: value })}
                  >
                    {value}+ hours / week
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "25px" }}>
              <label style={{ display: "block", marginBottom: "15px" }}>
                Preferred learning style
              </label>
              <div className="preference-grid">
                {[
                  "Hands-on projects",
                  "Short video lessons",
                  "Docs & reading",
                ].map((style) => (
                  <button
                    key={style}
                    className={data.learningStyle === style ? "selected" : ""}
                    onClick={() => setData({ ...data, learningStyle: style })}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "25px" }}>
              <label style={{ display: "block", marginBottom: "15px" }}>
                Difficulty level
              </label>
              <div className="preference-grid">
                {["Gentle", "Balanced", "Challenging"].map((difficulty) => (
                  <button
                    key={difficulty}
                    className={data.difficulty === difficulty ? "selected" : ""}
                    onClick={() => setData({ ...data, difficulty })}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          className="primary-btn onboarding-next"
          onClick={saveAndContinue}
          disabled={loading}
        >
          {loading
            ? "Building your path..."
            : step < 3
              ? "Continue"
              : "Build my personalized path"}{" "}
          <ArrowRight size={16} />
        </button>
      </main>
    </div>
  );
}
