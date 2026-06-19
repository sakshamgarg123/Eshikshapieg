import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Home, FileText, Search, Megaphone } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface AnalyticsData {
  name: string;
  revenue: number;
  students: number;
}

const data: AnalyticsData[] = [
  { name: 'Mon', revenue: 4000, students: 240 },
  { name: 'Tue', revenue: 3000, students: 139 },
  { name: 'Wed', revenue: 2000, students: 980 },
  { name: 'Thu', revenue: 2780, students: 390 },
  { name: 'Fri', revenue: 1890, students: 480 },
  { name: 'Sat', revenue: 2390, students: 380 },
  { name: 'Sun', revenue: 3490, students: 430 },
];

export function AnalyticsDashboard({ students }: { students: any[] }) {
  const [analytics, setAnalytics] = React.useState({ users: 0, sessions: 0, avgEngagementTime: '0s' });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch analytics', err);
        setLoading(false);
      });
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Admin Analytics Report', 10, 10);
    doc.text(`Total Students: ${students.length}`, 10, 20);
    doc.text(`GA Users: ${analytics.users}`, 10, 30);
    doc.save('analytics-report.pdf');
  };

  return (
    <div className="flex w-full bg-slate-50 min-h-[600px] text-slate-900">
      {/* Faux Sidebar */}
      <div className="w-48 bg-white border-r border-slate-200 p-4 space-y-6">
        <h1 className="font-semibold text-lg flex items-center gap-2"><div className="w-6 h-6 bg-orange-500 rounded-sm"></div> Analytics</h1>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded-r-full"><Home className="w-4 h-4" /> Home</div>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 p-2"><FileText className="w-4 h-4" /> Reports</div>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 p-2"><Search className="w-4 h-4" /> Explore</div>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 p-2"><Megaphone className="w-4 h-4" /> Advertising</div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-slate-900">Reports snapshot</h2>
          <button 
            onClick={exportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2 rounded text-sm font-medium"
          >
            <Download className="w-4 h-4" /> Export to PDF
          </button>
        </div>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="text-xs font-medium text-slate-500 uppercase">Users</h3>
            <p className="text-2xl font-semibold mt-1">{loading ? '...' : analytics.users}</p>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="text-xs font-medium text-slate-500 uppercase">Sessions</h3>
            <p className="text-2xl font-semibold mt-1">{loading ? '...' : analytics.sessions}</p>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="text-xs font-medium text-slate-500 uppercase">Avg. Engagement Time</h3>
            <p className="text-2xl font-semibold mt-1">{loading ? '...' : analytics.avgEngagementTime}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-slate-700 mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-slate-700 mb-6">Students Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
