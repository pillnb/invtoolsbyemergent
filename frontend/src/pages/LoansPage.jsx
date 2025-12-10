import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LoansPage({ user }) {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    const filtered = loans.filter(loan => {
      const searchLower = searchTerm.toLowerCase();
      return (
        loan.borrower_name.toLowerCase().includes(searchLower) ||
        loan.project_name.toLowerCase().includes(searchLower) ||
        loan.wbs_project_no.toLowerCase().includes(searchLower) ||
        loan.equipments.some(eq => eq.equipment_name.toLowerCase().includes(searchLower))
      );
    });
    setFilteredLoans(filtered);
  }, [searchTerm, loans]);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/loans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data);
      setFilteredLoans(response.data);
    } catch (error) {
      toast.error('Failed to fetch loan records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (loanId, borrowerName, loanDate) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/loans/${loanId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `loan_${borrowerName.replace(/\s+/g, '_')}_${loanDate}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Loan Records</h1>
        <p className="text-slate-600 mt-1">View all equipment loan history</p>
      </div>

      {/* Search Bar */}
      <Card className="shadow-md border-slate-200">
        <CardContent className="pt-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Search by borrower, project name, WBS number, or equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-800">{filteredLoans.length}</span> of <span className="font-semibold text-slate-800">{loans.length}</span> loan records
          </div>
        </CardContent>
      </Card>

      {/* Loans List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading loan records...</div>
        ) : filteredLoans.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-slate-500">
              {searchTerm ? 'No loan records found matching your search' : 'No loan records available'}
            </CardContent>
          </Card>
        ) : (
          filteredLoans.map((loan) => (
            <Card key={loan.id} className="shadow-md hover:shadow-lg transition-shadow border-slate-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">
                      {loan.borrower_name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Project: {loan.project_name} • WBS: {loan.wbs_project_no}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownloadPDF(loan.id, loan.borrower_name, loan.loan_date)}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-600">Loan Date</p>
                    <p className="font-medium text-slate-800">{loan.loan_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Return Date</p>
                    <p className="font-medium text-slate-800">{loan.return_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Project Location</p>
                    <p className="font-medium text-slate-800">{loan.project_location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created By</p>
                    <p className="font-medium text-slate-800">{loan.created_by}</p>
                  </div>
                </div>

                {/* Equipment List */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Equipment Borrowed:</p>
                  <div className="space-y-2">
                    {loan.equipments.map((equipment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{equipment.equipment_name}</p>
                          <p className="text-sm text-slate-600">Serial: {equipment.serial_no}</p>
                        </div>
                        <Badge className={`${
                          equipment.condition === 'Good' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        } border font-medium`}>
                          {equipment.condition}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}