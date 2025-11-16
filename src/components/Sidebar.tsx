import { FolderOpen, Shield, Home, User, Building2 } from 'lucide-react';
import type { Screen } from '../App';

type SidebarProps = {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
};

export function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', screen: 'dashboard' as Screen },
    { icon: FolderOpen, label: 'My Cases', screen: 'my-cases' as Screen },
    { icon: Building2, label: 'Insurance Plans', screen: 'insurance-plans' as Screen },
    { icon: User, label: 'Settings', screen: 'settings' as Screen }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">PolicyPilot</span>
        </div>
      </div>
      
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-lg">
          <Shield className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-900">HIPAA Compliant</p>
            <p className="text-xs text-green-700">Your data is secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
