import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import LoanDialog from '../components/LoanDialog';
import CalibrationDialog from '../components/CalibrationDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FormsPage({ user }) {
  const [tools, setTools] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  
  // Stock consumption form state
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchTools();
    fetchStockItems();
  }, []);

  const fetchTools = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/tools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTools(response.data);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  };

  const fetchStockItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStockItems(response.data);
    } catch (error) {
      console.error('Failed to fetch stock items:', error);
    }
  };

  const handleConsumeStock = async (e) => {
    e.preventDefault();
    
    if (!selectedItem || !quantity || parseInt(quantity) <= 0) {
      toast.error('Please select an item and enter a valid quantity');
      return;
    }

    const item = stockItems.find(i => i.id === selectedItem);
    if (parseInt(quantity) > item.available_quantity) {
      toast.error(`Insufficient stock. Available: ${item.available_quantity} ${item.unit}`);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/stock/consume`,
        {
          item_id: selectedItem,
          quantity: parseInt(quantity),
          reason: reason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Stock consumed successfully');
      
      // Reset form
      setSelectedItem('');
      setQuantity('');
      setReason('');
      
      // Refresh stock items
      fetchStockItems();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to consume stock');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItemData = stockItems.find(i => i.id === selectedItem);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Forms</h1>
        <p className="text-slate-600 mt-1">Access all forms for equipment and stock management</p>
      </div>

      {/* Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Form Card */}
        {isAdmin && (
          <Card className="shadow-md hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Equipment Loan Form</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Create a new equipment loan record</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                Record equipment loans with borrower details, project information, and equipment list (up to 5 items). Generate PDF with signature fields.
              </p>
              <Button
                onClick={() => setLoanDialogOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Open Loan Form
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Calibration Form Card */}
        {isAdmin && (
          <Card className="shadow-md hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Calibration Form</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Record equipment calibration details</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                Record calibration information including dates, agency, location, and responsible person. Updates tool calibration status automatically.
              </p>
              <Button
                onClick={() => setCalibrationDialogOpen(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Open Calibration Form
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stock Consumption Form */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Consume Stock</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Record consumption of consumable items</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleConsumeStock} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item Selection */}
              <div className="space-y-2">
                <Label htmlFor="item-select" className="text-slate-700 font-medium">Select Item *</Label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger id="item-select" className="h-11 border-slate-300">
                    <SelectValue placeholder="Choose a stock item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stockItems.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">No stock items available</div>
                    ) : (
                      stockItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.item_name} ({item.available_quantity} {item.unit} available)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity-input" className="text-slate-700 font-medium">
                  Quantity to Use * {selectedItemData && `(Max: ${selectedItemData.available_quantity})`}
                </Label>
                <Input
                  id="quantity-input"
                  type="number"
                  min="1"
                  max={selectedItemData?.available_quantity || 999999}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity..."
                  className="h-11 border-slate-300"
                  disabled={!selectedItem}
                />
              </div>
            </div>

            {/* Selected Item Info */}
            {selectedItemData && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Item Name</p>
                    <p className="font-medium text-slate-800">{selectedItemData.item_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Brand/Spec</p>
                    <p className="font-medium text-slate-800">{selectedItemData.brand_specifications}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Available</p>
                    <p className="font-medium text-slate-800">{selectedItemData.available_quantity} {selectedItemData.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">After Consumption</p>
                    <p className="font-bold text-orange-600">
                      {Math.max(0, selectedItemData.available_quantity - (parseInt(quantity) || 0))} {selectedItemData.unit}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reason/Note */}
            <div className="space-y-2">
              <Label htmlFor="reason-textarea" className="text-slate-700 font-medium">Reason / Note</Label>
              <Textarea
                id="reason-textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for consumption (optional)..."
                rows={3}
                className="border-slate-300 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedItem('');
                  setQuantity('');
                  setReason('');
                }}
                className="border-slate-300 text-slate-700"
                disabled={submitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!selectedItem || !quantity || submitting}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Consume Stock'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dialogs */}
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