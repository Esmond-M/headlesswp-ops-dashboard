import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { EditorialQueuePage } from './pages/EditorialQueuePage';
import { OverviewPage } from './pages/OverviewPage';
import { PortfolioIntelligencePage } from './pages/PortfolioIntelligencePage';
import { SeoAuditPage } from './pages/SeoAuditPage';

const links = [
  { to: '/', label: 'Overview' },
  { to: '/editorial-queue', label: 'Editorial Queue' },
  { to: '/portfolio-intelligence', label: 'Portfolio Intelligence' },
  { to: '/seo-audit', label: 'SEO Audit' },
];

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">HeadlessWP Ops</div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/editorial-queue" element={<EditorialQueuePage />} />
          <Route path="/portfolio-intelligence" element={<PortfolioIntelligencePage />} />
          <Route path="/seo-audit" element={<SeoAuditPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
