import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AnalysisPage({ user }) {
  const [summary, setSummary] = useState(null);
  const [toolsUsage, setToolsUsage] = useState([]);
  const [toolsDamaged, setToolsDamaged] = useState(null);
  const [toolsLost, setToolsLost] = useState(null);
  const [stockRequested, setStockRequested] = useState(null);
  const [stockPurchased, setStockPurchased] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [
        summaryRes,
        usageRes,
        damagedRes,
        lostRes,
        requestedRes,
        purchasedRes
      ] = await Promise.all([
        axios.get(`${API}/analysis/summary`, { headers }),
        axios.get(`${API}/analysis/tools-usage`, { headers }),
        axios.get(`${API}/analysis/tools-damaged`, { headers }),
        axios.get(`${API}/analysis/tools-lost`, { headers }),
        axios.get(`${API}/analysis/stock-requested`, { headers }),
        axios.get(`${API}/analysis/stock-purchased`, { headers })
      ]);

      setSummary(summaryRes.data);
      setToolsUsage(usageRes.data);
      setToolsDamaged(damagedRes.data);
      setToolsLost(lostRes.data);
      setStockRequested(requestedRes.data);
      setStockPurchased(purchasedRes.data);
    } catch (error) {
      console.error('Failed to fetch analysis data:', error);
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
        <div className="text-center text-slate-500">Loading analysis...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Analysis & Reports</h1>
        <p className="text-slate-600 mt-1">Comprehensive analysis of tools usage, damage, and stock management</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tools"
          value={summary?.total_tools || 0}
          subtitle={`${summary?.good_tools || 0} Good, ${summary?.damaged_tools || 0} Damaged`}
          color="text-blue-600"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          }
        />
        <StatCard
          title="Damage Rate"
          value={`${summary?.damage_rate || 0}%`}
          subtitle={`${summary?.damaged_tools || 0} tools damaged`}
          color="text-red-600"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Loans"
          value={summary?.total_loans || 0}
          subtitle="Equipment borrowed"
          color="text-green-600"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Low Stock Items"
          value={summary?.low_stock_items || 0}
          subtitle={`${summary?.low_stock_rate || 0}% of total stock`}
          color="text-yellow-600"
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      {/* Tools Usage Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b">
            <CardTitle className="text-lg font-bold text-slate-800">Most Frequently Used Tools</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {toolsUsage.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No usage data available</p>
            ) : (
              <div className="space-y-3">
                {toolsUsage.map((tool, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-blue-600 text-white">{index + 1}</Badge>
                      <span className="font-medium text-slate-800">{tool.equipment_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">{tool.usage_count} times</span>
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(tool.usage_count / toolsUsage[0].usage_count) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Damaged Tools Analysis */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-slate-50 border-b">
            <CardTitle className="text-lg font-bold text-slate-800">Damaged Tools by Type</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {toolsDamaged?.total_damaged === 0 ? (
              <p className="text-center text-slate-500 py-8">No damaged tools</p>
            ) : (
              <div className="space-y-3">
                {toolsDamaged?.by_type.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-600 text-white">{index + 1}</Badge>
                      <span className="font-medium text-slate-800">{item.type}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">{item.count} damaged</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Damaged Tools by Brand */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-slate-50 border-b">
          <CardTitle className="text-lg font-bold text-slate-800">Damaged Tools by Brand</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {toolsDamaged?.by_brand.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No damaged tools</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolsDamaged?.by_brand.map((item, index) => (
                <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{item.brand}</span>
                    <Badge className="bg-orange-600 text-white">{item.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Potentially Lost Tools */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-slate-50 border-b">
          <CardTitle className="text-lg font-bold text-slate-800">
            Potentially Lost/Missing Tools ({toolsLost?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {toolsLost?.total === 0 ? (
            <p className="text-center text-slate-500 py-8">No missing tools detected</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">Equipment Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">Serial No.</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">Brand/Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">Last Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {toolsLost?.potential_lost.map((tool, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{tool.equipment_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{tool.serial_no}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{tool.brand_type}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{tool.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequently Requested Stock */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-slate-50 border-b">
            <CardTitle className="text-lg font-bold text-slate-800">
              Frequently Requested Stock (Low Inventory)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {stockRequested?.frequently_requested.length === 0 ? (
              <p className="text-center text-slate-500 py-8">All stock levels are adequate</p>
            ) : (
              <div className="space-y-3">
                {stockRequested?.frequently_requested.slice(0, 5).map((item, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{item.item_name}</p>
                        <p className="text-xs text-slate-600">{item.brand_specifications}</p>
                      </div>
                      <Badge className={`${
                        item.available_quantity < 10 ? 'bg-red-600' : 'bg-yellow-600'
                      } text-white`}>
                        {item.available_quantity} {item.unit}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frequently Purchased Stock */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-slate-50 border-b">
            <CardTitle className="text-lg font-bold text-slate-800">
              Frequently Purchased Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">By Item Name</h4>
                <div className="space-y-2">
                  {stockPurchased?.by_item.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-slate-800">{item.item_name}</span>
                      <Badge className="bg-green-600 text-white">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">By Brand</h4>
                <div className="space-y-2">
                  {stockPurchased?.by_brand.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-slate-800">{item.brand}</span>
                      <Badge className="bg-green-600 text-white">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
