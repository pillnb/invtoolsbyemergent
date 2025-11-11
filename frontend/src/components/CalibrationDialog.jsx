import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CalibrationDialog({ open, onOpenChange, tools, onSuccess }) {
  const [formData, setFormData] = useState({
    device_name: '',
    serial_no: '',
    calibration_date: '',
    calibration_expiry_date: '',
    device_condition: 'Good',
    calibration_agency: '',
    calibration_location: '',
    person_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleDeviceSelect = (deviceName) => {
    const selectedTool = tools.find(t => t.equipment_name === deviceName);
    if (selectedTool) {
      setFormData({
        ...formData,
        device_name: deviceName,
        serial_no: selectedTool.serial_no,
        device_condition: selectedTool.condition
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/calibrations`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Calibration record created successfully');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        device_name: '',
        serial_no: '',
        calibration_date: '',
        calibration_expiry_date: '',
        device_condition: 'Good',
        calibration_agency: '',
        calibration_location: '',
        person_name: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create calibration record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="calibration-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Calibration Form</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device_name">Device Name *</Label>
              <Select
                value={formData.device_name}
                onValueChange={handleDeviceSelect}
              >
                <SelectTrigger data-testid="device-name-select">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {tools.map((tool) => (
                    <SelectItem key={tool.id} value={tool.equipment_name}>
                      {tool.equipment_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_no">Serial No. *</Label>
              <Input
                id="serial_no"
                data-testid="cal-serial-input"
                value={formData.serial_no}
                onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calibration_date">Calibration Date *</Label>
              <Input
                id="calibration_date"
                data-testid="cal-date-input"
                type="date"
                value={formData.calibration_date}
                onChange={(e) => setFormData({ ...formData, calibration_date: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calibration_expiry_date">Calibration Expiry Date *</Label>
              <Input
                id="calibration_expiry_date"
                data-testid="cal-expiry-input"
                type="date"
                value={formData.calibration_expiry_date}
                onChange={(e) => setFormData({ ...formData, calibration_expiry_date: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device_condition">Device Condition *</Label>
              <Select
                value={formData.device_condition}
                onValueChange={(value) => setFormData({ ...formData, device_condition: value })}
              >
                <SelectTrigger data-testid="device-condition-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calibration_agency">Calibration Agency *</Label>
              <Input
                id="calibration_agency"
                data-testid="agency-input"
                value={formData.calibration_agency}
                onChange={(e) => setFormData({ ...formData, calibration_agency: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calibration_location">Calibration Location *</Label>
              <Input
                id="calibration_location"
                data-testid="cal-location-input"
                value={formData.calibration_location}
                onChange={(e) => setFormData({ ...formData, calibration_location: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="person_name">Person Who Brought Device *</Label>
              <Input
                id="person_name"
                data-testid="person-name-input"
                value={formData.person_name}
                onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="cancel-cal-btn"
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="submit-cal-btn"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? 'Saving...' : 'Create Calibration Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
