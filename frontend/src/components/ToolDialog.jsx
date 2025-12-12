import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ToolDialog({ open, onOpenChange, tool, onSuccess }) {
  const [formData, setFormData] = useState({
    equipment_name: '',
    brand_type: '',
    serial_no: '',
    inventory_code: '',
    asset_number: '',
    periodic_inspection_date: '',
    calibration_date: '',
    calibration_validity_months: 12,
    condition: 'Good',
    description: '',
    equipment_location: ''
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [manualFile, setManualFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (tool) {
      setFormData({
        equipment_name: tool.equipment_name,
        brand_type: tool.brand_type,
        serial_no: tool.serial_no,
        inventory_code: tool.inventory_code,
        asset_number: tool.asset_number || '',
        periodic_inspection_date: tool.periodic_inspection_date || '',
        calibration_date: tool.calibration_date || '',
        calibration_validity_months: tool.calibration_validity_months,
        condition: tool.condition,
        description: tool.description || '',
        equipment_location: tool.equipment_location
      });
    } else {
      setFormData({
        equipment_name: '',
        brand_type: '',
        serial_no: '',
        inventory_code: '',
        asset_number: '',
        periodic_inspection_date: '',
        calibration_date: '',
        calibration_validity_months: 12,
        condition: 'Good',
        description: '',
        equipment_location: ''
      });
    }
    setCertificateFile(null);
    setManualFile(null);
  }, [tool, open]);

  const handleFileUpload = async (toolId) => {
    const token = localStorage.getItem('token');
    
    if (certificateFile) {
      const certFormData = new FormData();
      certFormData.append('file', certificateFile);
      
      try {
        await axios.post(`${API}/tools/${toolId}/upload-certificate`, certFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Certificate uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload certificate');
      }
    }
    
    if (manualFile) {
      const manualFormData = new FormData();
      manualFormData.append('file', manualFile);
      
      try {
        await axios.post(`${API}/tools/${toolId}/upload-manual`, manualFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Manual uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload manual');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let toolId;
      
      if (tool) {
        await axios.put(`${API}/tools/${tool.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toolId = tool.id;
        toast.success('Tool updated successfully');
      } else {
        const response = await axios.post(`${API}/tools`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toolId = response.data.id;
        toast.success('Tool added successfully');
      }
      
      // Upload files if any
      if (certificateFile || manualFile) {
        setUploadingFiles(true);
        await handleFileUpload(toolId);
        setUploadingFiles(false);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="tool-dialog" aria-describedby="tool-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            {tool ? 'Edit Tool' : 'Add New Tool'}
          </DialogTitle>
          <p id="tool-dialog-description" className="sr-only">
            {tool ? 'Edit existing tool information' : 'Add a new tool to the system'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipment_name">Equipment Name *</Label>
              <Input
                id="equipment_name"
                data-testid="equipment-name-input"
                value={formData.equipment_name}
                onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand_type">Brand/Type *</Label>
              <Input
                id="brand_type"
                data-testid="brand-type-input"
                value={formData.brand_type}
                onChange={(e) => setFormData({ ...formData, brand_type: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_no">Serial No. *</Label>
              <Input
                id="serial_no"
                data-testid="serial-no-input"
                value={formData.serial_no}
                onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory_code">Inventory Code *</Label>
              <Input
                id="inventory_code"
                data-testid="inventory-code-input"
                value={formData.inventory_code}
                onChange={(e) => setFormData({ ...formData, inventory_code: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodic_inspection_date">Periodic Inspection Date</Label>
              <Input
                id="periodic_inspection_date"
                data-testid="inspection-date-input"
                type="date"
                value={formData.periodic_inspection_date}
                onChange={(e) => setFormData({ ...formData, periodic_inspection_date: e.target.value })}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calibration_date">Calibration Date</Label>
              <Input
                id="calibration_date"
                data-testid="calibration-date-input"
                type="date"
                value={formData.calibration_date}
                onChange={(e) => setFormData({ ...formData, calibration_date: e.target.value })}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calibration_validity_months">Calibration Validity (Months)</Label>
              <Input
                id="calibration_validity_months"
                data-testid="validity-months-input"
                type="number"
                min="1"
                value={formData.calibration_validity_months}
                onChange={(e) => setFormData({ ...formData, calibration_validity_months: parseInt(e.target.value) })}
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger data-testid="condition-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="equipment_location">Equipment Location *</Label>
              <Input
                id="equipment_location"
                data-testid="location-input"
                value={formData.equipment_location}
                onChange={(e) => setFormData({ ...formData, equipment_location: e.target.value })}
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
            
            {/* File Upload Section */}
            <div className="space-y-2 col-span-2 pt-4 border-t border-slate-200">
              <h3 className="font-semibold text-slate-700">Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calibration_certificate">Calibration Certificate</Label>
                  <Input
                    id="calibration_certificate"
                    data-testid="certificate-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setCertificateFile(e.target.files[0])}
                    className="border-slate-300"
                  />
                  {certificateFile && (
                    <p className="text-xs text-slate-600">{certificateFile.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment_manual">Equipment Manual</Label>
                  <Input
                    id="equipment_manual"
                    data-testid="manual-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setManualFile(e.target.files[0])}
                    className="border-slate-300"
                  />
                  {manualFile && (
                    <p className="text-xs text-slate-600">{manualFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="cancel-tool-btn"
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingFiles}
              data-testid="submit-tool-btn"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading || uploadingFiles ? 'Saving...' : (tool ? 'Update Tool' : 'Add Tool')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
