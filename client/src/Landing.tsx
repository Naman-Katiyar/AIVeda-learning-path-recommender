import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Clock3,
  Compass,
  Flame,
  Lightbulb,
  Lock,
  Play,
  Sparkles,
  Target,
} from "lucide-react";

type Props = { onNavigate: (path: string) => void };
const Avatar = () => <div className="avatar">AI</div>;
const Logo = () => (
  <div className="logo">
    <span className="logo-mark">
      <i className="bi bi-stars" aria-hidden="true" />
    </span>
    <span>AIveda</span>
  </div>
);

export default function Landing({ onNavigate }: Props) {
  const steps = [
    ["01", "Tell us your goal", "Start with the ambition in your own words."],
    ["02", "Map your skills", "See what you know and what matters next."],
    ["03", "Build your roadmap", "Get a sequence that respects prerequisites."],
    ["04", "Learn and adapt", "Your path evolves as you do."],
  ];
  const features = [
    [
      "AI Career Planning",
      "Turn an open-ended ambition into a concrete destination.",
      Target,
    ],
    [
      "Skill Gap Analysis",
      "Know exactly where your effort has the highest return.",
      BarChart3,
    ],
    [
      "Adaptive Roadmaps",
      "A path that responds to pace, feedback, and confidence.",
      Compass,
    ],
    [
      "AI Learning Assistant",
      "A context-aware copilot for every question along the way.",
      Bot,
    ],
  ] as const;
  return (
    <div className="landing">
      <header className="landing-nav container-fluid">
        <Logo />
        <div className="landing-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#paths">Example paths</a>
        </div>
        <div className="landing-auth">
          <button className="text-btn" onClick={() => onNavigate("/login")}>
            Sign in
          </button>
          <button
            className="primary-btn"
            onClick={() => onNavigate("/register")}
          >
            Start learning <ArrowRight size={15} />
          </button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={13} /> PERSONALIZED LEARNING, REIMAGINED
            </div>
            <h1>
              Turn your goals into a <em>personalized</em> learning path.
            </h1>
            <p>
              AIVeda understands where you are, where you want to go, and the
              shortest meaningful path between the two.
            </p>
            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() => onNavigate("/register")}
              >
                Build my path <ArrowRight size={16} />
              </button>
              <button
                className="secondary-btn"
                onClick={() => onNavigate("/login")}
              >
                Sign in <ArrowRight size={15} />
              </button>
            </div>
            <div className="hero-proof">
              <span>AI-powered personalized learning paths</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="orbit-label label-top">
              <Sparkles size={13} /> AI-curated
            </div>
            <div className="path-preview">
              <div className="preview-header">
                <div>
                  <span className="section-kicker">Your path to</span>
                  <strong>Full Stack Developer</strong>
                </div>
                <span className="preview-percent">34%</span>
              </div>
              <div className="preview-progress">
                <span />
              </div>
              <div className="preview-node completed">
                <span>
                  <Check size={14} />
                </span>
                <div>
                  <strong>JavaScript foundations</strong>
                  <small>Completed · 8 hours</small>
                </div>
              </div>
              <div className="preview-connector" />
              <div className="preview-node active">
                <span>
                  <Play size={13} fill="currentColor" />
                </span>
                <div>
                  <strong>Async programming</strong>
                  <small>In progress · 6 hours</small>
                </div>
                <b>Next</b>
              </div>
              <div className="preview-connector dashed" />
              <div className="preview-node locked">
                <span>
                  <Lock size={13} />
                </span>
                <div>
                  <strong>Node.js foundations</strong>
                  <small>Unlocks next</small>
                </div>
              </div>
              <div className="preview-footer">
                <span>
                  <Flame size={14} /> 12 day streak
                </span>
                <span>
                  <Clock3 size={14} /> 5.2h this week
                </span>
              </div>
            </div>
            <div className="floating-note">
              <div className="insight-icon">
                <Lightbulb size={15} />
              </div>
              <span>
                <strong>Next best step</strong>
                <br />
                Finish Async programming
              </span>
            </div>
          </div>
        </section>
        <section className="landing-section how" id="how">
          <div className="center-heading">
            <span className="eyebrow">A smarter way forward</span>
            <h2>Less guessing. More progress.</h2>
            <p>
              AIVeda turns the messy middle of learning into a clear, adaptive
              system.
            </p>
          </div>
          <div className="steps">
            {steps.map(([number, title, copy]) => (
              <div className="step" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <ArrowRight size={17} />
              </div>
            ))}
          </div>
        </section>
        <section className="landing-section feature-section" id="features">
          <div className="feature-heading">
            <div>
              <span className="eyebrow">Everything in one place</span>
              <h2>Your learning, with a point of view.</h2>
            </div>
            <p>
              From first goal to portfolio proof, AIVeda keeps the signal
              visible and the next action obvious.
            </p>
          </div>
          <div className="feature-grid">
            {features.map(([title, copy, Icon]) => (
              <article className="feature-tile" key={title}>
                <div className="feature-icon">
                  <Icon size={19} />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
                <ArrowRight size={16} />
              </article>
            ))}
          </div>
        </section>
        <section className="landing-cta">
          <div>
            <span className="eyebrow">The next chapter starts here</span>
            <h2>Your next skill is waiting.</h2>
            <p>Bring the goal. We will help with the path.</p>
          </div>
          <button
            className="primary-btn"
            onClick={() => onNavigate("/register")}
          >
            Start learning <ArrowRight size={16} />
          </button>
        </section>
      </main>
      <footer className="landing-footer">
        <Logo />
        <span>© 2026 AIVeda · Learn with focus. Grow with direction.</span>
      </footer>
    </div>
  );
}
