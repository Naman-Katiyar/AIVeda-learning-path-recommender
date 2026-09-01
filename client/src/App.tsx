import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  Flame,
  FolderKanban,
  Gauge,
  GraduationCap,
  Home,
  LayoutGrid,
  Lightbulb,
  Sun,
  Lock,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Landing from "./Landing";
import AuthPage from "./AuthPage";
import Onboarding from "./Onboarding";
import { api } from "./services/api";

type View =
  | "dashboard"
  | "roadmap"
  | "skills"
  | "recommendations"
  | "projects"
  | "analytics"
  | "assistant"
  | "profile"
  | "settings"
  | "admin";
type ItemStatus = "completed" | "in_progress" | "available" | "locked";
type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type RoadmapItem = {
  id: number;
  title: string;
  phase: string;
  type: string;
  hours: number;
  difficulty: string;
  skill: string;
  status: ItemStatus;
  reason: string;
  description: string;
};

const navGroups = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Overview", icon: Home },
      { id: "roadmap", label: "My roadmap", icon: Compass },
      { id: "skills", label: "Skill gaps", icon: Target },
      { id: "recommendations", label: "Recommendations", icon: Sparkles },
    ],
  },
  {
    label: "Learn",
    items: [
      { id: "projects", label: "Projects", icon: FolderKanban },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "assistant", label: "AI assistant", icon: Bot },
    ],
  },
];

const initialItems: RoadmapItem[] = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    phase: "01 / Foundations",
    type: "Course",
    hours: 8,
    difficulty: "Foundational",
    skill: "JavaScript",
    status: "completed",
    reason:
      "You have a strong base here. Completing this unlocked asynchronous programming.",
    description:
      "Build fluency with modern syntax, functions, objects, and the mental models that make the rest of your path easier.",
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    phase: "01 / Foundations",
    type: "Topic",
    hours: 10,
    difficulty: "Intermediate",
    skill: "JavaScript",
    status: "completed",
    reason:
      "A high-value bridge between your current JavaScript confidence and backend work.",
    description:
      "Deepen your understanding of closures, prototypes, modules, and performance.",
  },
  {
    id: 3,
    title: "Async programming",
    phase: "01 / Foundations",
    type: "Topic",
    hours: 6,
    difficulty: "Intermediate",
    skill: "JavaScript",
    status: "in_progress",
    reason:
      "Your next prerequisite for Node.js. A focused 6-hour sprint keeps momentum high.",
    description:
      "Learn promises, async/await, event loops, and reliable error handling.",
  },
  {
    id: 4,
    title: "Node.js foundations",
    phase: "02 / Backend",
    type: "Course",
    hours: 12,
    difficulty: "Intermediate",
    skill: "Node.js",
    status: "available",
    reason:
      "Your largest skill gap is backend runtime fluency, making this the highest-impact next step.",
    description:
      "Move JavaScript beyond the browser and build production-minded command line and server programs.",
  },
  {
    id: 5,
    title: "Express & REST APIs",
    phase: "02 / Backend",
    type: "Course",
    hours: 10,
    difficulty: "Intermediate",
    skill: "APIs",
    status: "locked",
    reason:
      "Unlocks after Node.js foundations. Prerequisites keep the learning curve humane.",
    description:
      "Design clean REST endpoints, middleware, validation, and error responses.",
  },
  {
    id: 6,
    title: "MongoDB data modeling",
    phase: "02 / Backend",
    type: "Course",
    hours: 9,
    difficulty: "Intermediate",
    skill: "MongoDB",
    status: "locked",
    reason: "Database confidence is a priority gap for your full-stack goal.",
    description:
      "Model data intentionally, query efficiently, and connect a document database to your API.",
  },
  {
    id: 7,
    title: "Production API capstone",
    phase: "03 / Ship it",
    type: "Project",
    hours: 18,
    difficulty: "Advanced",
    skill: "System design",
    status: "locked",
    reason:
      "A portfolio proof point that combines every backend skill in your path.",
    description:
      "Ship a secure, tested API with authentication, persistence, observability, and deployment.",
  },
];

const weekly = [
  { day: "Mon", hours: 1.2 },
  { day: "Tue", hours: 0.8 },
  { day: "Wed", hours: 1.6 },
  { day: "Thu", hours: 1.1 },
  { day: "Fri", hours: 2.3 },
  { day: "Sat", hours: 0.5 },
  { day: "Sun", hours: 0.9 },
];
const skillData = [
  { name: "JavaScript", current: 75, target: 90 },
  { name: "React", current: 55, target: 82 },
  { name: "Node.js", current: 35, target: 80 },
  { name: "MongoDB", current: 45, target: 75 },
  { name: "Git", current: 70, target: 85 },
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("aiveda_theme");
    return saved ? saved === "dark" : true;
  });
  const [view, setView] = useState<View>("dashboard");
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem("aiveda_user");
    try {
      return savedUser ? (JSON.parse(savedUser) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [items, setItems] = useState<RoadmapItem[]>([]);
  useEffect(() => {
    localStorage.setItem("aiveda_theme", dark ? "dark" : "light");
  }, [dark]);
  const [analytics, setAnalytics] = useState<{
    overallProgress: number;
    currentStreak: number;
    hoursLearned: number;
    completedTopics: number;
    recentActivity: any[];
  }>({
    overallProgress: 0,
    currentStreak: 0,
    hoursLearned: 0,
    completedTopics: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selected, setSelected] = useState<RoadmapItem | null>(null);

  // Load real user data on mount
  useEffect(() => {
    const token = localStorage.getItem("aiveda_token");
    const publicPaths = ["/", "/login", "/register"];

    if (!token && publicPaths.includes(location.pathname)) {
      setAuthUser(null);
      setLoading(false);
      setProfileMenuOpen(false);
      return;
    }

    if (!token) {
      localStorage.removeItem("aiveda_user");
      setAuthUser(null);
      navigate("/", { replace: true });
      setLoading(false);
      return;
    }

    if (location.pathname === "/login" || location.pathname === "/register") {
      navigate("/dashboard", { replace: true });
      return;
    }

    (async () => {
      try {
        const [user, paths, analytics] = await Promise.all([
          api.me().catch(() => null),
          api.getPaths().catch(() => []),
          api.getAnalytics().catch(() => ({
            overallProgress: 0,
            currentStreak: 0,
            hoursLearned: 0,
            completedTopics: 0,
            recentActivity: [],
          })),
        ]);

        if (user) {
          setAuthUser(user);
          localStorage.setItem("aiveda_user", JSON.stringify(user));
        } else {
          const fallbackUser = (() => {
            const savedUser = localStorage.getItem("aiveda_user");
            if (!savedUser) return null;
            try {
              return JSON.parse(savedUser) as AuthUser;
            } catch {
              return null;
            }
          })();
          if (fallbackUser) {
            setAuthUser(fallbackUser);
          }
        }

        if (paths[0]?.items) {
          setItems(
            paths[0].items.map((item: any) => ({
              id: item.id.split("-")[0] || Math.random(),
              title: item.title,
              phase: item.skill,
              type: item.type,
              hours: item.estimatedHours,
              difficulty: item.difficulty,
              skill: item.skill,
              status: item.status as ItemStatus,
              reason: item.reason,
              description: item.description,
            })),
          );
        }
        setAnalytics(analytics);
      } catch (e) {
        console.error("Failed to load user data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, location.pathname]);

  const completed = items.filter((item) => item.status === "completed").length;

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    try {
      await api.logout().catch(() => undefined);
    } finally {
      localStorage.removeItem("aiveda_token");
      localStorage.removeItem("aiveda_user");
      setAuthUser(null);
      navigate("/login", { replace: true });
    }
  };

  const go = (next: View) => {
    setView(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const markComplete = (id: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "completed" } : item,
      ),
    );
    const item = items.find((candidate) => candidate.id === id);
    if (item)
      void api
        .updateProgress(String(item.id), "completed")
        .catch(() => undefined);
  };

  if (location.pathname === "/")
    return <Landing onNavigate={navigate} dark={dark} setDark={setDark} />;
  if (location.pathname === "/login" || location.pathname === "/register") {
    return (
      <AuthPage
        mode={location.pathname.slice(1) as "login" | "register"}
        onNavigate={navigate}
        dark={dark}
        setDark={setDark}
      />
    );
  }
  if (location.pathname === "/onboarding")
    return (
      <Onboarding
        onComplete={() => navigate("/dashboard")}
        dark={dark}
        setDark={setDark}
      />
    );

  return (
    <div className={dark ? "app dark" : "app"}>
      <header className="mobile-header">
        <button
          className="icon-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <Logo />
        <div className="mobile-actions">
          <button className="icon-btn" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <div className="profile-menu-root" data-profile-menu-root>
            <button
              className="avatar-button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-label="User profile menu"
            >
              <Avatar name={authUser?.name} />
            </button>
            {profileMenuOpen && (
              <div className="profile-menu">
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    go("profile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="profile-menu-item danger"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-top">
          <Logo />
          <button
            className="icon-btn close-mobile"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="profile-mini">
          <Avatar name={authUser?.name} />
          <div>
            <strong>{authUser?.name || "Learner"}</strong>
            <span>
              {authUser?.role
                ? `${authUser.role} learner`
                : "Full-stack learner"}
            </span>
          </div>
          <ChevronRight size={16} />
        </div>
        <nav>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-label">{group.label}</span>
              {group.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={view === id ? "nav-item active" : "nav-item"}
                  onClick={() => go(id as View)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {id === "recommendations" && (
                    <span className="nav-count">3</span>
                  )}
                </button>
              ))}
            </div>
          ))}
          <div className="nav-group">
            <span className="nav-label">Account</span>
            <button
              className={view === "profile" ? "nav-item active" : "nav-item"}
              onClick={() => go("profile")}
            >
              <UserRound size={17} />
              <span>Profile</span>
            </button>
            <button
              className={view === "settings" ? "nav-item active" : "nav-item"}
              onClick={() => go("settings")}
            >
              <Settings size={17} />
              <span>Settings</span>
            </button>
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade">
            <div className="upgrade-icon">
              <Zap size={16} />
            </div>
            <strong>Keep your momentum</strong>
            <p>3-day streak. You are ahead of pace.</p>
            <button onClick={() => go("roadmap")}>
              View roadmap <ArrowRight size={14} />
            </button>
          </div>
          <div className="sidebar-footer">
            <span>v1.0.0</span>
            <button
              className="theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
            >
              {dark ? <Moon size={16} /> : <Sparkles size={16} />}
            </button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{viewLabel(view)}</strong>
          </div>
          <div className="top-actions">
            <button className="command" onClick={() => go("assistant")}>
              <Search size={16} />
              <span>Search anything</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-btn notification"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <button
              className="icon-btn theme-toggle-btn"
              onClick={() => setDark(!dark)}
              aria-label={
                dark ? "Switch to light theme" : "Switch to dark theme"
              }
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="profile-menu-root" data-profile-menu-root>
              <button
                className="avatar-button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-label="User profile menu"
              >
                <Avatar name={authUser?.name} />
              </button>
              {profileMenuOpen && (
                <div className="profile-menu">
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      go("profile");
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="profile-menu-item danger"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {renderView(view, {
              items,
              completed,
              go,
              setSelected,
              markComplete,
              selected,
              setItems,
              authUser,
            })}
          </motion.div>
        </AnimatePresence>
      </main>
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onComplete={() => {
            markComplete(selected.id);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function viewLabel(view: View) {
  return {
    dashboard: "Overview",
    roadmap: "My roadmap",
    skills: "Skill gaps",
    recommendations: "Recommendations",
    projects: "Projects",
    analytics: "Analytics",
    assistant: "AI assistant",
    profile: "Profile",
    settings: "Settings",
    admin: "Admin",
  }[view];
}
function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        <i className="bi bi-stars" aria-hidden="true" />
      </span>
      <span>AIveda</span>
    </div>
  );
}
function Avatar({ name = "L" }: { name?: string }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "L";

  return <div className="avatar">{initials}</div>;
}

type Context = {
  items: RoadmapItem[];
  completed: number;
  go: (view: View) => void;
  setSelected: (item: RoadmapItem) => void;
  markComplete: (id: number) => void;
  selected: RoadmapItem | null;
  setItems: React.Dispatch<React.SetStateAction<RoadmapItem[]>>;
  authUser: AuthUser | null;
};
function renderView(view: View, context: Context) {
  switch (view) {
    case "dashboard":
      return <Dashboard {...context} />;
    case "roadmap":
      return <Roadmap {...context} />;
    case "skills":
      return <Skills />;
    case "recommendations":
      return <Recommendations />;
    case "projects":
      return <Projects />;
    case "analytics":
      return <Analytics />;
    case "assistant":
      return <Assistant />;
    case "profile":
      return <Profile />;
    default:
      return <SettingsView />;
  }
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
function Stat({
  icon: Icon,
  label,
  value,
  detail,
  tone = "mint",
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="stat-card">
      <div className={"stat-icon " + tone}>
        <Icon size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function Dashboard({ items, completed, go, setSelected, authUser }: Context) {
  const next =
    items.find((item) => item.status === "in_progress") ??
    items.find((item) => item.status === "available");
  const firstName = authUser?.name?.split(/\s+/).filter(Boolean)[0] ?? "there";

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  return (
    <div className="content">
      <PageHeader
        eyebrow={formattedDate}
        title={`${greeting}, ${firstName}.`}
        description="A clear path beats a perfect plan. Here is your next best step."
        action={
          <button className="primary-btn" onClick={() => go("roadmap")}>
            <Play size={16} fill="currentColor" /> Continue learning
          </button>
        }
      />
      <section className="stats-grid">
        <Stat
          icon={Gauge}
          label="Overall progress"
          value="34%"
          detail="+8% this month"
        />
        <Stat
          icon={Flame}
          label="Current streak"
          value="12 days"
          detail="Personal best: 18 days"
          tone="peach"
        />
        <Stat
          icon={Clock3}
          label="Hours learned"
          value="24.8h"
          detail="5.2h this week"
          tone="blue"
        />
        <Stat
          icon={Trophy}
          label="XP earned"
          value="1,240"
          detail="240 to next level"
          tone="yellow"
        />
      </section>
      <div className="dashboard-grid">
        <section className="panel focus-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Recommended next action</span>
              <h2>Stay in flow</h2>
            </div>
            <button className="more-btn" aria-label="More options">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="focus-card">
            <div className="focus-number">03</div>
            <div className="focus-copy">
              <div className="tag-row">
                <span className="tag mint">In progress</span>
                <span className="muted">6 hours</span>
              </div>
              <h3>{next?.title}</h3>
              <p>{next?.description}</p>
              <div className="progress-line">
                <span style={{ width: "42%" }} />
              </div>
              <div className="focus-footer">
                <span>
                  <BookOpen size={15} /> 3 lessons remaining
                </span>
                <button
                  className="text-btn"
                  onClick={() => next && setSelected(next)}
                >
                  View details <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
          <div className="ai-insight">
            <div className="insight-icon">
              <Sparkles size={17} />
            </div>
            <div>
              <strong>AI insight</strong>
              <p>
                You have been learning consistently for 5 days. Finish Async
                programming this week to unlock your next backend milestone.
              </p>
            </div>
          </div>
        </section>
        <section className="panel weekly-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">This week</span>
              <h2>Learning rhythm</h2>
            </div>
            <button className="text-btn" onClick={() => go("analytics")}>
              Details <ArrowRight size={15} />
            </button>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="hours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#91d5bd" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#91d5bd" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e6ebe6" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#84908a", fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #dfe7e1",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#368f77"
                  strokeWidth={2.5}
                  fill="url(#hours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="weekly-total">
            <strong>5.2h</strong>
            <span>of 6h weekly goal</span>
            <div className="mini-progress">
              <span style={{ width: "86%" }} />
            </div>
            <b>86%</b>
          </div>
        </section>
      </div>
      <div className="dashboard-grid lower">
        <section className="panel roadmap-preview">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Your journey</span>
              <h2>Full Stack Developer</h2>
            </div>
            <button className="text-btn" onClick={() => go("roadmap")}>
              Open roadmap <ArrowRight size={15} />
            </button>
          </div>
          <div className="journey">
            <div className="journey-line" />
            <div className="journey-node done">
              <Check size={15} />
            </div>
            <div className="journey-node current">
              <span>03</span>
            </div>
            <div className="journey-node locked">
              <Lock size={14} />
            </div>
            <div className="journey-node locked">
              <Lock size={14} />
            </div>
            <div className="journey-copy">
              <div>
                <strong>Foundations</strong>
                <span>2 / 3 complete</span>
              </div>
              <div>
                <strong>Backend</strong>
                <span>Next chapter</span>
              </div>
              <div>
                <strong>Ship it</strong>
                <span>Locked</span>
              </div>
              <div>
                <strong>Capstone</strong>
                <span>Locked</span>
              </div>
            </div>
          </div>
        </section>
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Recent activity</span>
              <h2>Small wins add up</h2>
            </div>
            <button className="more-btn" aria-label="More options">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <ActivityRow
            icon={Check}
            title="Advanced JavaScript completed"
            time="Today, 9:42 AM"
            color="green"
          />
          <ActivityRow
            icon={Target}
            title="New skill target: Node.js"
            time="Yesterday"
            color="blue"
          />
          <ActivityRow
            icon={Trophy}
            title="7-day learning streak"
            time="Aug 23"
            color="yellow"
          />
        </section>
      </div>
    </div>
  );
}
function ActivityRow({
  icon: Icon,
  title,
  time,
  color,
}: {
  icon: typeof Check;
  title: string;
  time: string;
  color: string;
}) {
  return (
    <div className="activity-row">
      <div className={"activity-icon " + color}>
        <Icon size={15} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{time}</span>
      </div>
      <ChevronRight size={15} />
    </div>
  );
}

function Roadmap({ items, setSelected }: Context) {
  const phases = [...new Set(items.map((item) => item.phase))];
  return (
    <div className="content">
      <PageHeader
        eyebrow="Your personalized path"
        title="Full Stack Developer"
        description="A 20-week adaptive plan built around your goals, skills, and pace."
        action={
          <button className="secondary-btn">
            <Plus size={16} /> Add learning goal
          </button>
        }
      />
      <div className="roadmap-summary">
        <div>
          <span className="section-kicker">Path progress</span>
          <strong>34%</strong>
          <div className="progress-line">
            <span style={{ width: "34%" }} />
          </div>
          <small>8 of 24 milestones complete</small>
        </div>
        <div className="summary-divider" />
        <div>
          <span className="section-kicker">Target date</span>
          <strong>Jan 18, 2027</strong>
          <small>20 weeks remaining</small>
        </div>
        <div className="summary-divider" />
        <div>
          <span className="section-kicker">Current pace</span>
          <strong className="green-text">Ahead of pace</strong>
          <small>+1.5 weeks</small>
        </div>
      </div>
      <div className="roadmap-list">
        {phases.map((phase, index) => (
          <section className="phase" key={phase}>
            <div className="phase-marker">
              <span>0{index + 1}</span>
              <div />
            </div>
            <div className="phase-content">
              <div className="phase-heading">
                <div>
                  <span className="section-kicker">Phase {index + 1}</span>
                  <h2>{phase.split(" / ")[1]}</h2>
                </div>
                <span className="phase-status">
                  {index === 0
                    ? "In progress"
                    : index === 1
                      ? "Up next"
                      : "Locked"}
                </span>
              </div>
              <div className="roadmap-items">
                {items
                  .filter((item) => item.phase === phase)
                  .map((item) => (
                    <RoadmapCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelected(item)}
                    />
                  ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
function RoadmapCard({
  item,
  onClick,
}: {
  item: RoadmapItem;
  onClick: () => void;
}) {
  return (
    <button className={"roadmap-card " + item.status} onClick={onClick}>
      <div className="roadmap-card-status">
        {item.status === "completed" ? (
          <Check size={16} />
        ) : item.status === "locked" ? (
          <Lock size={14} />
        ) : item.status === "in_progress" ? (
          <Play size={14} fill="currentColor" />
        ) : (
          <span>{item.id}</span>
        )}
      </div>
      <div className="roadmap-card-main">
        <div className="tag-row">
          <span
            className={"tag " + (item.status === "locked" ? "gray" : "mint")}
          >
            {item.type}
          </span>
          <span className="muted">
            <Clock3 size={13} /> {item.hours}h
          </span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.reason}</p>
        <div className="card-meta">
          <span>{item.skill}</span>
          <span>{item.difficulty}</span>
        </div>
      </div>
      <ChevronRight className="card-arrow" size={18} />
    </button>
  );
}

function Skills() {
  return (
    <div className="content">
      <PageHeader
        eyebrow="Your skill profile"
        title="Close the gap"
        description="Build the skills that move you toward Full Stack Developer with confidence."
        action={
          <button className="secondary-btn">
            <UserRound size={16} /> Edit profile
          </button>
        }
      />
      <div className="skills-layout">
        <section className="panel skill-overview">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Skill development</span>
              <h2>Current vs. target</h2>
            </div>
            <button className="filter-btn">
              All skills <ChevronRight size={14} />
            </button>
          </div>
          <div className="skill-bars">
            {skillData.map((skill) => (
              <div className="skill-row" key={skill.name}>
                <div className="skill-row-top">
                  <strong>{skill.name}</strong>
                  <span>
                    <b>{skill.current}</b> / {skill.target}
                  </span>
                </div>
                <div className="dual-bar">
                  <span
                    className="target-bar"
                    style={{ width: skill.target + "%" }}
                  />
                  <span
                    className="current-bar"
                    style={{ width: skill.current + "%" }}
                  />
                </div>
                <small>
                  {skill.target - skill.current <= 15
                    ? "On track"
                    : "Priority gap"}{" "}
                  <span>+{skill.target - skill.current} to target</span>
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel gap-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Priority focus</span>
              <h2>Where to invest time</h2>
            </div>
            <CircleHelp size={17} />
          </div>
          <div className="priority">
            <div className="priority-score">82</div>
            <div>
              <strong>Node.js</strong>
              <span>Highest impact gap</span>
              <p>Closing this gap unlocks 4 roadmap milestones.</p>
            </div>
          </div>
          <div className="priority">
            <div className="priority-score orange">68</div>
            <div>
              <strong>MongoDB</strong>
              <span>Build next</span>
              <p>Practice with a small API project.</p>
            </div>
          </div>
          <div className="priority">
            <div className="priority-score blue">44</div>
            <div>
              <strong>React</strong>
              <span>Maintain</span>
              <p>Your current foundation is healthy.</p>
            </div>
          </div>
        </section>
      </div>
      <section className="panel insight-wide">
        <div className="insight-icon">
          <Lightbulb size={18} />
        </div>
        <div>
          <strong>Your learning profile is taking shape</strong>
          <p>
            You learn best through hands-on projects and short focused sessions.
            AIVeda is weighting project-based resources 18% higher for you.
          </p>
        </div>
        <button className="text-btn">
          See profile <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}

function Recommendations() {
  const recs = [
    {
      title: "Node.js fundamentals",
      provider: "Frontend Masters",
      type: "Course",
      hours: "8 hours",
      score: "94%",
      color: "mint",
    },
    {
      title: "Build an API with Express",
      provider: "AIVeda project",
      type: "Project",
      hours: "6 hours",
      score: "89%",
      color: "blue",
    },
    {
      title: "MongoDB data modeling",
      provider: "MongoDB University",
      type: "Course",
      hours: "5 hours",
      score: "84%",
      color: "peach",
    },
  ];
  return (
    <div className="content">
      <PageHeader
        eyebrow="Curated for your next step"
        title="Recommendations"
        description="The best next resources, selected from your gaps, pace, and preferences."
        action={
          <button className="filter-btn">
            <LayoutGrid size={15} /> Filters{" "}
            <span className="filter-dot">3</span>
          </button>
        }
      />
      <div className="recommendation-banner">
        <div className="banner-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <strong>Personalized just for you</strong>
          <p>
            These picks balance your Node.js gap with your preference for
            practical, project-led learning.
          </p>
        </div>
        <button className="icon-btn">
          <X size={16} />
        </button>
      </div>
      <div className="recommendation-grid">
        {recs.map((rec, i) => (
          <article className="recommendation-card" key={rec.title}>
            <div className="rec-art">
              <div className="rec-number">0{i + 1}</div>
              <div className="rec-art-icon">
                <BookOpen size={25} />
              </div>
              <span className="tag white">{rec.type}</span>
            </div>
            <div className="rec-body">
              <div className="rec-title">
                <h3>{rec.title}</h3>
                <span className="match">{rec.score} match</span>
              </div>
              <p className="provider">
                {rec.provider} <span>·</span> {rec.hours}
              </p>
              <div className="why">
                <Sparkles size={14} />
                <span>
                  Why this? <b>Closes a priority gap</b>
                </span>
              </div>
              <button className="primary-btn full">
                View recommendation <ArrowRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Projects() {
  const projects = [
    {
      title: "Expense Tracker API",
      level: "Intermediate",
      hours: "12-16h",
      skills: ["Node.js", "Express", "MongoDB"],
      accent: "project-green",
      description:
        "Build a secure REST API with auth, categories, and monthly insights.",
    },
    {
      title: "Realtime study room",
      level: "Advanced",
      hours: "20-28h",
      skills: ["React", "WebSockets", "Node.js"],
      accent: "project-blue",
      description:
        "Create a shared learning space with presence, rooms, and live notes.",
    },
    {
      title: "AI learning companion",
      level: "Capstone",
      hours: "36-45h",
      skills: ["Full stack", "LLMs", "Deployment"],
      accent: "project-ink",
      description:
        "Ship a production-grade AI application that adapts to a learner.",
    },
  ];
  return (
    <div className="content">
      <PageHeader
        eyebrow="Learn by building"
        title="Projects for your portfolio"
        description="Practical work that turns your new skills into proof."
        action={
          <button className="primary-btn">
            <Sparkles size={16} /> Generate project
          </button>
        }
      />
      <div className="project-feature">
        <div>
          <span className="section-kicker">Recommended project</span>
          <h2>Expense Tracker API</h2>
          <p>
            A focused project to turn your Node.js foundations into a
            portfolio-ready backend. You will practice validation,
            authentication, and data modeling.
          </p>
          <div className="tag-row">
            <span className="tag mint">Intermediate</span>
            <span className="muted">
              <Clock3 size={13} /> 12-16 hours
            </span>
          </div>
          <button className="secondary-btn">
            View project brief <ArrowRight size={15} />
          </button>
        </div>
        <div className="feature-illustration">
          <div className="terminal">
            <span>aiveda / projects</span>
            <b>$ npm create expense-api</b>
            <i>building something useful...</i>
            <em>✓ 4 milestones · 0 / 4 complete</em>
          </div>
        </div>
      </div>
      <div className="section-heading-inline">
        <div>
          <span className="section-kicker">Project library</span>
          <h2>Stretch your skills</h2>
        </div>
        <button className="filter-btn">
          All levels <ChevronRight size={14} />
        </button>
      </div>
      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <div className={"project-visual " + project.accent}>
              <FolderKanban size={26} />
              <span>{project.level}</span>
            </div>
            <div className="project-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tag-row">
                {project.skills.map((skill) => (
                  <span className="tag gray" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
              <div className="project-footer">
                <span>
                  <Clock3 size={14} /> {project.hours}
                </span>
                <button
                  className="icon-btn"
                  aria-label={"Open " + project.title}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Analytics() {
  return (
    <div className="content">
      <PageHeader
        eyebrow="Your learning data"
        title="Analytics"
        description="See the habits and skills moving you forward."
        action={
          <button className="filter-btn">
            Last 30 days <ChevronRight size={14} />
          </button>
        }
      />
      <section className="stats-grid">
        <Stat
          icon={TrendingUp}
          label="Completion rate"
          value="78%"
          detail="+12% vs. last month"
        />
        <Stat
          icon={Clock3}
          label="Avg. session"
          value="42m"
          detail="Ideal for your pace"
          tone="blue"
        />
        <Stat
          icon={Activity}
          label="Quiz accuracy"
          value="86%"
          detail="+9% this month"
          tone="yellow"
        />
        <Stat
          icon={Flame}
          label="Active days"
          value="21"
          detail="of 30 days"
          tone="peach"
        />
      </section>
      <div className="analytics-grid">
        <section className="panel chart-panel large">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Learning hours</span>
              <h2>Consistency compounds</h2>
            </div>
            <span className="chart-legend">
              <i /> Hours
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekly} barSize={28}>
              <CartesianGrid vertical={false} stroke="#e6ebe6" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#84908a", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#84908a", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "#f2f6f3" }}
                contentStyle={{
                  border: "1px solid #dfe7e1",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="hours" fill="#4ca88d" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Skill growth</span>
              <h2>Momentum</h2>
            </div>
          </div>
          <div className="growth-list">
            {skillData.slice(0, 4).map((skill) => (
              <div className="growth-row" key={skill.name}>
                <span>{skill.name}</span>
                <div className="mini-progress">
                  <span style={{ width: skill.current + "%" }} />
                </div>
                <b>+{Math.round(skill.current / 8)}%</b>
              </div>
            ))}
          </div>
          <div className="analytics-callout">
            <Sparkles size={15} />
            <span>Node.js is accelerating fastest</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function Assistant() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hey Alex. I have your roadmap and current progress in view. What would you like to make clearer today?",
    },
  ]);
  const send = async () => {
    if (!message.trim()) return;
    const next = message;
    setMessages((current) => [...current, { from: "user", text: next }]);
    setMessage("");
    setSending(true);
    try {
      const result = await api.chat(next, "Async programming");
      setMessages((current) => [
        ...current,
        { from: "ai", text: result.answer },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          from: "ai",
          text: "I couldn't reach the assistant right now. Your next best step is Async programming, which unlocks Node.js.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="content assistant-page">
      <PageHeader
        eyebrow="Your learning copilot"
        title="Ask AIVeda"
        description="A grounded conversation about your goals, skills, and next steps."
      />
      <div className="assistant-layout">
        <aside className="conversation-list panel">
          <div className="conversation-heading">
            <h3>Conversations</h3>
            <button className="icon-btn">
              <Plus size={17} />
            </button>
          </div>
          <button className="conversation active">
            <MessageCircle size={16} />
            <span>My learning plan</span>
            <MoreHorizontal size={15} />
          </button>
          <button className="conversation">
            <MessageCircle size={16} />
            <span>Node.js questions</span>
          </button>
          <button className="conversation">
            <MessageCircle size={16} />
            <span>Project ideas</span>
          </button>
        </aside>
        <section className="chat panel">
          <div className="chat-header">
            <div className="assistant-avatar">
              <Bot size={19} />
            </div>
            <div>
              <strong>AIVeda AI</strong>
              <span>
                <i /> Context-aware assistant
              </span>
            </div>
            <button className="more-btn">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="messages">
            {messages.map((msg, index) => (
              <div className={"message " + msg.from} key={index}>
                {msg.from === "ai" && (
                  <div className="assistant-avatar small">
                    <Bot size={14} />
                  </div>
                )}
                <div className="bubble">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="suggestions">
            <button onClick={() => setMessage("What should I learn next?")}>
              What should I learn next?
            </button>
            <button onClick={() => setMessage("Make my roadmap faster")}>
              Make my roadmap faster
            </button>
            <button onClick={() => setMessage("Give me a project to practice")}>
              Project idea
            </button>
          </div>
          <div className="chat-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void send()}
              placeholder={
                sending
                  ? "AIVeda is thinking..."
                  : "Ask anything about your path..."
              }
              aria-label="Message AIVeda AI"
              disabled={sending}
            />
            <button
              onClick={() => void send()}
              disabled={sending}
              className="send-btn"
              aria-label="Send message"
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <small className="chat-disclaimer">
            AI can make mistakes. Your private profile is used only to
            personalize this conversation.
          </small>
        </section>
      </div>
    </div>
  );
}

function Profile() {
  const storedUser = localStorage.getItem("aiveda_user");
  let userName = "Learner";

  try {
    const parsed = storedUser ? JSON.parse(storedUser) : null;
    if (parsed?.name) userName = parsed.name;
  } catch {
    // ignore invalid stored user payload
  }

  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "L";

  return (
    <div className="content">
      <PageHeader
        eyebrow="Learner profile"
        title={userName}
        description="Your profile helps AIVeda tune every recommendation."
        action={
          <button className="secondary-btn">
            <Settings size={16} /> Edit profile
          </button>
        }
      />
      <div className="profile-grid">
        <section className="panel profile-card">
          <div className="profile-cover" />
          <div className="profile-intro">
            <div className="avatar large">{initials}</div>
            <div>
              <h2>{userName}</h2>
              <p>Building toward Full Stack Developer</p>
              <span className="tag mint">Learning since Apr 2026</span>
            </div>
          </div>
          <div className="profile-facts">
            <div>
              <span>Experience</span>
              <strong>Intermediate</strong>
            </div>
            <div>
              <span>Learning pace</span>
              <strong>Focused</strong>
            </div>
            <div>
              <span>Hours / week</span>
              <strong>6 hours</strong>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">About your goal</span>
              <h2>Full Stack Developer</h2>
            </div>
            <Target size={18} />
          </div>
          <p className="goal-copy">
            “I want to become a confident full-stack developer and build
            products that people actually use.”
          </p>
          <div className="goal-detail">
            <span>Target date</span>
            <strong>January 2027</strong>
          </div>
          <div className="goal-detail">
            <span>Preferred learning</span>
            <strong>Project-led · Video + docs</strong>
          </div>
        </section>
      </div>
      <div className="section-heading-inline">
        <div>
          <span className="section-kicker">Your interests</span>
          <h2>What keeps you curious</h2>
        </div>
      </div>
      <div className="interest-list">
        {["Web development", "Backend", "AI", "Product design", "Cloud"].map(
          (interest) => (
            <span className="interest" key={interest}>
              <Check size={14} /> {interest}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
function SettingsView() {
  return (
    <div className="content">
      <PageHeader
        eyebrow="Workspace preferences"
        title="Settings"
        description="Make AIVeda feel like yours."
      />
      <div className="settings-list">
        <section className="panel setting-row">
          <div className="setting-icon">
            <Bell size={18} />
          </div>
          <div>
            <h3>Learning reminders</h3>
            <p>Get a gentle nudge when your weekly rhythm needs attention.</p>
          </div>
          <button className="switch on" aria-label="Learning reminders on">
            <i />
          </button>
        </section>
        <section className="panel setting-row">
          <div className="setting-icon">
            <Moon size={18} />
          </div>
          <div>
            <h3>Appearance</h3>
            <p>Switch between light and dark mode from the navigation.</p>
          </div>
          <button className="secondary-btn">
            Manage <ChevronRight size={15} />
          </button>
        </section>
        <section className="panel setting-row">
          <div className="setting-icon">
            <Users size={18} />
          </div>
          <div>
            <h3>Privacy & data</h3>
            <p>
              Control how your learning activity is used to personalize
              recommendations.
            </p>
          </div>
          <button className="secondary-btn">
            Review <ChevronRight size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
function DetailModal({
  item,
  onClose,
  onComplete,
}: {
  item: RoadmapItem;
  onClose: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="detail-modal"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-top">
          <span
            className={"tag " + (item.status === "locked" ? "gray" : "mint")}
          >
            {item.type}
          </span>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-number">0{item.id}</div>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <div className="why large">
          <Sparkles size={15} />
          <span>
            <b>Why this recommendation</b>
            {item.reason}
          </span>
        </div>
        <div className="modal-facts">
          <div>
            <Clock3 size={16} />
            <span>
              Estimated time<strong>{item.hours} hours</strong>
            </span>
          </div>
          <div>
            <Gauge size={16} />
            <span>
              Difficulty<strong>{item.difficulty}</strong>
            </span>
          </div>
          <div>
            <Target size={16} />
            <span>
              Skill focus<strong>{item.skill}</strong>
            </span>
          </div>
        </div>
        <div className="modal-actions">
          {item.status === "locked" ? (
            <button className="secondary-btn full" disabled>
              <Lock size={15} /> Complete prerequisites first
            </button>
          ) : item.status === "completed" ? (
            <button className="secondary-btn full">
              <Check size={15} /> Completed
            </button>
          ) : (
            <>
              <button className="primary-btn full" onClick={onComplete}>
                <Check size={15} /> Mark complete
              </button>
              <button className="icon-btn" aria-label="Ask AI">
                <Bot size={18} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default App;
