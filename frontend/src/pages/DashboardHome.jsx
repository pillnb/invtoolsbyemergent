import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardHome({ user }) {
  const [stats, setStats] = useState({
    totalTools: 0,
    expiredTools: 0,
    expiringSoon: 0,
    validTools: 0,
    goodCondition: 0,
    damagedCondition: 0,
    totalLoans: 0,
    totalCalibrations: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch tools
      const toolsResponse = await axios.get(`${API}/tools`, { headers });
      const tools = toolsResponse.data;

      // Calculate statistics
      const expired = tools.filter(t => t.status === 'Expired').length;
      const expiring = tools.filter(t => t.status === 'Expiring Soon').length;
      const valid = tools.filter(t => t.status === 'Valid').length;
      const good = tools.filter(t => t.condition === 'Good').length;
      const damaged = tools.filter(t => t.condition === 'Damaged').length;

      // Fetch loans and calibrations
      const loansResponse = await axios.get(`${API}/loans`, { headers });
      const calibrationsResponse = await axios.get(`${API}/calibrations`, { headers });

      setStats({
        totalTools: tools.length,
        expiredTools: expired,
        expiringSoon: expiring,
        validTools: valid,
        goodCondition: good,
        damagedCondition: damaged,
        totalLoans: loansResponse.data.length,
        totalCalibrations: calibrationsResponse.data.length
      });

      // Create recent activities
      const activities = [];
      
      // Add recent calibrations
      calibrationsResponse.data.slice(0, 3).forEach(cal => {
        activities.push({
          type: 'calibration',
          text: `Calibration recorded for ${cal.device_name}`,
          time: new Date(cal.created_at).toLocaleDateString(),
          user: cal.created_by
        });
      });

      // Add recent loans
      loansResponse.data.slice(0, 2).forEach(loan => {
        activities.push({
          type: 'loan',
          text: `Equipment loaned to ${loan.borrower_name}`,
          time: loan.loan_date,
          user: loan.created_by
        });
      });

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <h3 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-600 mt-1">Welcome back, {user.full_name}</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tools"
          value={stats.totalTools}
          subtitle="Equipment registered"
          color="text-blue-600"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          }
        />
        <StatCard
          title="Expired Tools"
          value={stats.expiredTools}
          subtitle="Needs calibration"
          color="text-red-600"
          icon=(
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          subtitle="Within 3 months"
          color="text-yellow-600"
          icon=(
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        />
        <StatCard
          title="Valid Tools"
          value={stats.validTools}
          subtitle="Up to date"
          color="text-green-600"
          icon=(
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Good Condition</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.goodCondition}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Tools</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Damaged</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.damagedCondition}</p>
              </div>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">Tools</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Loans</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalLoans}</p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">Records</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Calibrations</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCalibrations}</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">Records</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
          <CardTitle className="text-xl font-bold text-slate-800">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {recentActivities.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'calibration' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {activity.type === 'calibration' ? (
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{activity.text}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {activity.time} • {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
