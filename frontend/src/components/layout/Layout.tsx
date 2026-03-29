import { ReactNode, useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';

export const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};