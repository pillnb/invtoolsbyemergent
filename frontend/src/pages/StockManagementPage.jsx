import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import StockDialog from '../components/StockDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StockManagementPage({ user }) {
  const [stockItems, setStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchStockItems();
  }, []);

  useEffect(() => {
    const filtered = stockItems.filter(item => 
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand_specifications.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, stockItems]);

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

      {/* Search Bar */}
      <Card className="shadow-md border-slate-200">
        <CardContent className="pt-6">
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
                      {isAdmin && (
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
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

      {/* Stock Dialog */}
      <StockDialog
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        item={selectedItem}
        isEditMode={isEditMode}
        onSuccess={fetchStockItems}
      />
    </div>
  );
}
