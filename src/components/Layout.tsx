import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import FitBot from './FitBot';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sage-200/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cream-300/40 blur-[120px]" />
      </div>

      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>

      <FitBot />
    </div>
  );
}
