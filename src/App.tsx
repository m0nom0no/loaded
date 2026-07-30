import { useWorkoutStore } from './store/useWorkoutStore';
import { Navigation } from './Navigation';
import { LiveWorkoutView } from './components/LiveWorkout/LiveWorkoutView';
import { MetricsDashboard } from './components/Dashboard/MetricsDashboard';
import { SqlSchemaViewer } from './components/SqlSchemaViewer';

export function App() {
  const { activeTab } = useWorkoutStore();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header & Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 mb-16">
        {activeTab === 'live' && <LiveWorkoutView />}
        {activeTab === 'dashboard' && <MetricsDashboard />}
        {activeTab === 'sql' && <SqlSchemaViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mb-14">
        <p>LOADED &copy; {new Date().getFullYear()} — Motor de Progresión Matemática y Guiado Determinista</p>
      </footer>
    </div>
  );
}

export default App;
