import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import AdminPage from './pages/AdminPage';
import KpPage from './pages/KpPage';

function Shell() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-5 py-2.5">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm">L</span>
            LoftCalc
          </button>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`
              }
            >
              Проекты
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`
              }
            >
              Настройки администратора
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/project/:id" element={<ConfiguratorPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/kp/:id" element={<KpPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
