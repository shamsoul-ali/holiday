import { Sidebar } from '../_components/Sidebar';
import { DateRangeProvider } from '../_components/DateRangeContext';
import { PresentationMode } from '../_components/PresentationMode';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <DateRangeProvider>
      <PresentationMode>
        <div className="flex min-h-screen">
          <div className="bayu-sidebar">
            <Sidebar />
          </div>
          <main className="bayu-main flex min-h-screen flex-1 min-w-0 flex-col">
            {children}
          </main>
        </div>
      </PresentationMode>
    </DateRangeProvider>
  );
}
