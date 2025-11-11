import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import ToolDialog from '../components/ToolDialog';
import LoanDialog from '../components/LoanDialog';
import CalibrationDialog from '../components/CalibrationDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user, onLogout }) {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    const filtered = tools.filter(tool => 
      tool.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.serial_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.inventory_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTools(filtered);
  }, [searchTerm, tools]);

  const fetchTools = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/tools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTools(response.data);
      setFilteredTools(response.data);
    } catch (error) {
      toast.error('Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/tools/export/excel`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tool_status.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const handleAddTool = () => {
    setSelectedTool(null);
    setToolDialogOpen(true);
  };

  const handleEditTool = (tool) => {
    setSelectedTool(tool);
    setToolDialogOpen(true);
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/tools/${toolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tool deleted successfully');
      fetchTools();
    } catch (error) {
      toast.error('Failed to delete tool');
    }
  };

  const handleDownloadBarcode = async (toolId, serialNo) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/tools/${toolId}/barcode`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `barcode_${serialNo}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Barcode downloaded successfully');
    } catch (error) {
      toast.error('Failed to download barcode');
    }
  };

  const handleDownloadCertificate = async (toolId, toolName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/tools/${toolId}/download-certificate`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${toolName}_certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      toast.error('Certificate not available');
    }
  };

  const handleDownloadManual = async (toolId, toolName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/tools/${toolId}/download-manual`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${toolName}_manual.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Manual downloaded successfully');
    } catch (error) {
      toast.error('Manual not available');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Valid': 'bg-green-100 text-green-800 border-green-200',
      'Expired': 'bg-red-100 text-red-800 border-red-200',
      'Expiring Soon': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Unknown': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return (
      <Badge className={`${styles[status]} border font-medium`} data-testid={`status-badge-${status.toLowerCase().replace(' ', '-')}`}>
        {status}
      </Badge>
    );
  };

  const getConditionBadge = (condition) => {
    return (
      <Badge 
        className={`${
          condition === 'Good' 
            ? 'bg-blue-100 text-blue-800 border-blue-200' 
            : 'bg-orange-100 text-orange-800 border-orange-200'
        } border font-medium`}
        data-testid={`condition-badge-${condition.toLowerCase()}`}
      >
        {condition}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Tool Management System</h1>
                <p className="text-sm text-slate-500">{user.full_name} ({user.role})</p>
              </div>
            </div>
            <Button 
              onClick={onLogout} 
              variant="outline"
              data-testid="logout-btn"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          {isAdmin && (
            <>
              <Button 
                onClick={handleAddTool}
                data-testid="add-tool-btn"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Tool
              </Button>
              <Button 
                onClick={() => setLoanDialogOpen(true)}
                data-testid="loan-form-btn"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Loan Form
              </Button>
              <Button 
                onClick={() => setCalibrationDialogOpen(true)}
                data-testid="calibration-form-btn"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Calibration Form
              </Button>
            </>
          )}
          <Button 
            onClick={handleExportExcel}
            data-testid="export-excel-btn"
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-md border-slate-200">
          <CardContent className="pt-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Search by equipment name, serial number, or inventory code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-input"
                className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tools Table */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-slate-800">Equipment Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading tools...</div>
            ) : filteredTools.length === 0 ? (
              <div className="p-8 text-center text-slate-500" data-testid="no-tools-message">No tools found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="tools-table">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Equipment Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Brand/Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Serial No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Inventory Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Calibration Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Condition</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Documents</th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredTools.map((tool, index) => (
                      <tr key={tool.id} className="hover:bg-slate-50 transition-colors" data-testid={`tool-row-${index}`}>
                        <td className="px-4 py-3 text-sm text-slate-700">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{tool.equipment_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{tool.brand_type}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{tool.serial_no}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{tool.inventory_code}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{tool.calibration_date || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{tool.calibration_expiry_date || '-'}</td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(tool.status)}</td>
                        <td className="px-4 py-3 text-sm">{getConditionBadge(tool.condition)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{tool.equipment_location}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            onClick={() => window.open(`/api/tools/${tool.id}/barcode`, '_blank')}
                            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Download
                          </Button>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleEditTool(tool)}
                                size="sm"
                                variant="ghost"
                                data-testid={`edit-tool-btn-${index}`}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteTool(tool.id)}
                                size="sm"
                                variant="ghost"
                                data-testid={`delete-tool-btn-${index}`}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <ToolDialog
        open={toolDialogOpen}
        onOpenChange={setToolDialogOpen}
        tool={selectedTool}
        onSuccess={fetchTools}
      />
      <LoanDialog
        open={loanDialogOpen}
        onOpenChange={setLoanDialogOpen}
        tools={tools}
      />
      <CalibrationDialog
        open={calibrationDialogOpen}
        onOpenChange={setCalibrationDialogOpen}
        tools={tools}
        onSuccess={fetchTools}
      />
    </div>
  );
}
