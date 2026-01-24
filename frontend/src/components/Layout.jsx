import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, BookOpen, PlusCircle, LogOut, Moon, User, Calendar, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/dreams', icon: BookOpen, label: 'Dreams' },
    { to: '/dreams/new', icon: PlusCircle, label: 'New Dream' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/patterns', icon: Brain, label: 'Patterns' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] starfield">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-black/90 backdrop-blur-xl border-r border-white/5 z-50 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-2xl text-white tracking-tight">Dreamscape</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors" data-testid="user-menu-button">
                <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-300" />
                </div>
                <span className="text-sm text-slate-300 truncate">{user?.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10">
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer" data-testid="logout-button">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-xl border-b border-white/5 z-50 md:hidden flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Moon className="w-6 h-6 text-purple-400" />
          <span className="font-serif text-xl text-white">Dreamscape</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-300" data-testid="mobile-user-menu">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
            <DropdownMenuItem disabled className="text-slate-400">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer" data-testid="mobile-logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/5 z-50 md:hidden flex justify-around py-3">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? 'active' : ''}`
            }
            data-testid={`mobile-nav-${label.toLowerCase().replace(' ', '-')}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <div className="p-6 md:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
