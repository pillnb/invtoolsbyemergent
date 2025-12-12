import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import ToolDialog from '../components/ToolDialog';
import LoanDialog from '../components/LoanDialog';
import CalibrationDialog from '../components/CalibrationDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ToolsPage({ user }) {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toolNameFilter, setToolNameFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchTools();
  }, []);

  // Get unique tool names for filter dropdown
  const uniqueToolNames = ['All', ...new Set(tools.map(tool => tool.equipment_name))];

  useEffect(() => {
    let filtered = tools.filter(tool => {
      // Text search filter
      const matchesSearch = 
        tool.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.serial_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.inventory_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tool name filter
      const matchesToolName = toolNameFilter === 'All' || tool.equipment_name === toolNameFilter;
      
      // Condition filter
      const matchesCondition = conditionFilter === 'All' || tool.condition === conditionFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'All' || tool.status === statusFilter;
      
      return matchesSearch && matchesToolName && matchesCondition && matchesStatus;
    });
    setFilteredTools(filtered);
  }, [searchTerm, toolNameFilter, conditionFilter, statusFilter, tools]);

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
    <div className="p-8 space-y-6">
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

        {/* Search and Filters */}
        <Card className="mb-6 shadow-md border-slate-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
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
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Filters:</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="tool-name-filter" className="text-sm text-slate-600">Tool Name</Label>
                  <Select
                    value={toolNameFilter}
                    onValueChange={setToolNameFilter}
                  >
                    <SelectTrigger id="tool-name-filter" data-testid="tool-name-filter" className="w-48 h-9 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueToolNames.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condition-filter" className="text-sm text-slate-600">Condition</Label>
                  <Select
                    value={conditionFilter}
                    onValueChange={setConditionFilter}
                  >
                    <SelectTrigger id="condition-filter" data-testid="condition-filter" className="w-32 h-9 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="status-filter" className="text-sm text-slate-600">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger id="status-filter" data-testid="status-filter" className="w-40 h-9 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Clear Filters Button */}
                {(toolNameFilter !== 'All' || conditionFilter !== 'All' || statusFilter !== 'All' || searchTerm) && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setToolNameFilter('All');
                      setConditionFilter('All');
                      setStatusFilter('All');
                    }}
                    variant="outline"
                    size="sm"
                    data-testid="clear-filters-btn"
                    className="text-xs text-slate-600 hover:text-slate-800"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </Button>
                )}
                
                {/* Results Count */}
                <div className="ml-auto text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-800">{filteredTools.length}</span> of <span className="font-semibold text-slate-800">{tools.length}</span> tools
                </div>
              </div>
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Asset Number</th>
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
                          <div className="flex flex-col space-y-1">
                            <Button
                              onClick={() => handleDownloadBarcode(tool.id, tool.serial_no)}
                              size="sm"
                              variant="outline"
                              data-testid={`barcode-btn-${index}`}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              QR Code
                            </Button>
                            {tool.calibration_certificate && (
                              <Button
                                onClick={() => handleDownloadCertificate(tool.id, tool.equipment_name)}
                                size="sm"
                                variant="outline"
                                data-testid={`cert-btn-${index}`}
                                className="text-xs text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Certificate
                              </Button>
                            )}
                            {tool.equipment_manual && (
                              <Button
                                onClick={() => handleDownloadManual(tool.id, tool.equipment_name)}
                                size="sm"
                                variant="outline"
                                data-testid={`manual-btn-${index}`}
                                className="text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Manual
                              </Button>
                            )}
                          </div>
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
