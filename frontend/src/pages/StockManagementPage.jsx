import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import StockDialog from '../components/StockDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StockManagementPage({ user }) {
  const [stockItems, setStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemNameFilter, setItemNameFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Consume stock dialog
  const [consumeDialogOpen, setConsumeDialogOpen] = useState(false);
  const [consumeItem, setConsumeItem] = useState(null);
  const [consumeQuantity, setConsumeQuantity] = useState('');
  const [consumeReason, setConsumeReason] = useState('');
  const [consuming, setConsuming] = useState(false);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchStockItems();
  }, []);

  // Get unique item names for filter dropdown
  const uniqueItemNames = ['All', ...new Set(stockItems.map(item => item.item_name))];

  useEffect(() => {
    const filtered = stockItems.filter(item => {
      const matchesSearch = 
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand_specifications.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesItemName = itemNameFilter === 'All' || item.item_name === itemNameFilter;
      
      return matchesSearch && matchesItemName;
    });
    setFilteredItems(filtered);
  }, [searchTerm, itemNameFilter, stockItems]);

  const fetchStockItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStockItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    setStockDialogOpen(true);
  };

  const handleEditStock = (item) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setStockDialogOpen(true);
  };

  const handleDeleteStock = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/stock/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item deleted successfully');
      fetchStockItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleDownloadReceipt = async (itemId, itemName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/stock/${itemId}/download-receipt`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${itemName}_receipt.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Receipt not available');
    }
  };

  const handleOpenConsumeDialog = (item) => {
    setConsumeItem(item);
    setConsumeQuantity('');
    setConsumeReason('');
    setConsumeDialogOpen(true);
  };

  const handleConsumeStock = async (e) => {
    e.preventDefault();
    
    if (!consumeQuantity || parseInt(consumeQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (parseInt(consumeQuantity) > consumeItem.available_quantity) {
      toast.error(`Insufficient stock. Available: ${consumeItem.available_quantity} ${consumeItem.unit}`);
      return;
    }

    setConsuming(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/stock/consume`,
        {
          item_id: consumeItem.id,
          quantity: parseInt(consumeQuantity),
          reason: consumeReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Stock consumed successfully');
      setConsumeDialogOpen(false);
      setConsumeItem(null);
      setConsumeQuantity('');
      setConsumeReason('');
      fetchStockItems();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to consume stock');
    } finally {
      setConsuming(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Stock Management</h1>
          <p className="text-slate-600 mt-1">Manage consumable items inventory</p>
        </div>
        {isAdmin && (
          <Button
            onClick={handleAddStock}
            data-testid="add-stock-btn"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Stock Item
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-md border-slate-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Search by item name or brand/specifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-stock-input"
                className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Filter:</span>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="item-name-filter" className="text-sm text-slate-600">Item Name</Label>
                <Select
                  value={itemNameFilter}
                  onValueChange={setItemNameFilter}
                >
                  <SelectTrigger id="item-name-filter" data-testid="item-name-filter" className="w-48 h-9 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueItemNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(itemNameFilter !== 'All' || searchTerm) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setItemNameFilter('All');
                  }}
                  variant="outline"
                  size="sm"
                  data-testid="clear-stock-filters-btn"
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
                Showing <span className="font-semibold text-slate-800">{filteredItems.length}</span> of <span className="font-semibold text-slate-800">{stockItems.length}</span> items
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Items Table */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <CardTitle className="text-xl font-bold text-slate-800">Stock Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading stock items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500" data-testid="no-items-message">No stock items found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="stock-table">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Brand/Specifications</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Available Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Receipt</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors" data-testid={`stock-row-${index}`}>
                      <td className="px-4 py-3 text-sm text-slate-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.item_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.brand_specifications}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <span className={`font-semibold ${
                          item.available_quantity < 10 ? 'text-red-600' : 
                          item.available_quantity < 50 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {item.available_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.description || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.purchase_receipt ? (
                          <Button
                            onClick={() => handleDownloadReceipt(item.id, item.item_name)}
                            size="sm"
                            variant="outline"
                            data-testid={`receipt-btn-${index}`}
                            className="text-xs text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleOpenConsumeDialog(item)}
                            size="sm"
                            variant="ghost"
                            data-testid={`consume-stock-btn-${index}`}
                            className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                            Consume
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                onClick={() => handleEditStock(item)}
                                size="sm"
                                variant="ghost"
                                data-testid={`edit-stock-btn-${index}`}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                Add Stock
                              </Button>
                              <Button
                                onClick={() => handleDeleteStock(item.id)}
                                size="sm"
                                variant="ghost"
                                data-testid={`delete-stock-btn-${index}`}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Dialog */}
      <StockDialog
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        item={selectedItem}
        isEditMode={isEditMode}
        onSuccess={fetchStockItems}
      />

      {/* Consume Stock Dialog */}
      <Dialog open={consumeDialogOpen} onOpenChange={setConsumeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Consume Stock
            </DialogTitle>
          </DialogHeader>
          
          {consumeItem && (
            <form onSubmit={handleConsumeStock} className="space-y-4">
              {/* Item Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-slate-600">Item Name</span>
                    <p className="font-medium text-slate-800">{consumeItem.item_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-600">Available</span>
                      <p className="font-bold text-green-600">
                        {consumeItem.available_quantity} {consumeItem.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-600">Brand/Spec</span>
                      <p className="text-sm text-slate-700">{consumeItem.brand_specifications}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="consume-quantity">Quantity to Use *</Label>
                <Input
                  id="consume-quantity"
                  type="number"
                  min="1"
                  max={consumeItem.available_quantity}
                  value={consumeQuantity}
                  onChange={(e) => setConsumeQuantity(e.target.value)}
                  placeholder={`Max: ${consumeItem.available_quantity}`}
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Remaining Preview */}
              {consumeQuantity && parseInt(consumeQuantity) > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">After Consumption:</span>
                    <span className="font-bold text-orange-600">
                      {Math.max(0, consumeItem.available_quantity - parseInt(consumeQuantity))} {consumeItem.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="consume-reason">Reason / Note</Label>
                <Textarea
                  id="consume-reason"
                  value={consumeReason}
                  onChange={(e) => setConsumeReason(e.target.value)}
                  placeholder="Enter reason for consumption (optional)..."
                  rows={3}
                  className="border-slate-300 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConsumeDialogOpen(false)}
                  disabled={consuming}
                  className="border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={consuming || !consumeQuantity}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {consuming ? (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
