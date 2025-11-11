import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StockDialog({ open, onOpenChange, item, isEditMode, onSuccess }) {
  const [formData, setFormData] = useState({
    item_name: '',
    brand_specifications: '',
    available_quantity: '',
    unit: '',
    description: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (isEditMode && item) {
      // For edit mode, only show quantity field
      setFormData({
        item_name: item.item_name,
        brand_specifications: item.brand_specifications,
        available_quantity: '',
        unit: item.unit,
        description: item.description || ''
      });
    } else {
      // For add mode, empty form
      setFormData({
        item_name: '',
        brand_specifications: '',
        available_quantity: '',
        unit: '',
        description: ''
      });
    }
    setReceiptFile(null);
  }, [item, isEditMode, open]);

  const handleFileUpload = async (itemId) => {
    if (!receiptFile) return;

    const token = localStorage.getItem('token');
    const fileFormData = new FormData();
    fileFormData.append('file', receiptFile);
    
    try {
      await axios.post(`${API}/stock/${itemId}/upload-receipt`, fileFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload receipt');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let itemId;
      
      if (isEditMode && item) {
        // Update existing item (add to quantity)
        await axios.put(`${API}/stock/${item.id}`, {
          available_quantity: parseInt(formData.available_quantity)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        itemId = item.id;
        toast.success(`Added ${formData.available_quantity} ${item.unit} to stock`);
      } else {
        // Create new item
        const response = await axios.post(`${API}/stock`, {
          ...formData,
          available_quantity: parseInt(formData.available_quantity)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        itemId = response.data.id;
        toast.success('Stock item added successfully');
      }
      
      // Upload receipt if provided
      if (receiptFile) {
        setUploadingFile(true);
        await handleFileUpload(itemId);
        setUploadingFile(false);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="stock-dialog" aria-describedby="stock-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            {isEditMode ? `Add Stock to ${item?.item_name}` : 'Add New Stock Item'}
          </DialogTitle>
          <p id="stock-dialog-description" className="sr-only">
            {isEditMode ? 'Add quantity to existing stock item' : 'Create a new stock item in inventory'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!isEditMode ? (
            // Full form for new items
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_name">Item Name *</Label>
                  <Input
                    id="item_name"
                    data-testid="item-name-input"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    required
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_specifications">Brand/Specifications *</Label>
                  <Input
                    id="brand_specifications"
                    data-testid="brand-specs-input"
                    value={formData.brand_specifications}
                    onChange={(e) => setFormData({ ...formData, brand_specifications: e.target.value })}
                    required
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available_quantity">Initial Quantity *</Label>
                  <Input
                    id="available_quantity"
                    data-testid="quantity-input"
                    type="number"
                    min="0"
                    value={formData.available_quantity}
                    onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                    required
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    data-testid="unit-input"
                    placeholder="e.g., pcs, kg, liters"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="border-slate-300 resize-none"
                  />
                </div>
              </div>
            </>
          ) : (
            // Simplified form for adding stock to existing items
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Current Stock:</span> {item?.available_quantity} {item?.unit}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Enter the quantity to add to existing stock
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_quantity">Quantity to Add *</Label>
                <Input
                  id="add_quantity"
                  data-testid="add-quantity-input"
                  type="number"
                  min="1"
                  value={formData.available_quantity}
                  onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                  required
                  className="border-slate-300"
                  placeholder={`Add quantity in ${item?.unit}`}
                />
              </div>
            </>
          )}

          {/* Purchase Receipt Upload */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <Label htmlFor="purchase_receipt">Purchase Receipt</Label>
            <Input
              id="purchase_receipt"
              data-testid="receipt-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setReceiptFile(e.target.files[0])}
              className="border-slate-300"
            />
            {receiptFile && (
              <p className="text-xs text-slate-600">{receiptFile.name}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="cancel-stock-btn"
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingFile}
              data-testid="submit-stock-btn"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading || uploadingFile ? 'Saving...' : (isEditMode ? 'Add to Stock' : 'Create Item')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
