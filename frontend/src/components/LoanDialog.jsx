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

export default function LoanDialog({ open, onOpenChange, tools }) {
  const [formData, setFormData] = useState({
    borrower_name: '',
    loan_date: '',
    return_date: '',
    project_name: '',
    wbs_project_no: '',
    project_location: '',
    equipments: [{ equipment_name: '', serial_no: '', condition: '' }]
  });
  const [loading, setLoading] = useState(false);

  const addEquipment = () => {
    if (formData.equipments.length < 5) {
      setFormData({
        ...formData,
        equipments: [...formData.equipments, { equipment_name: '', serial_no: '', condition: '' }]
      });
    } else {
      toast.error('Maximum 5 equipments allowed');
    }
  };

  const removeEquipment = (index) => {
    const newEquipments = formData.equipments.filter((_, i) => i !== index);
    setFormData({ ...formData, equipments: newEquipments });
  };

  const updateEquipment = (index, field, value) => {
    const newEquipments = [...formData.equipments];
    newEquipments[index][field] = value;
    
    // Auto-fill serial_no and condition when equipment is selected
    if (field === 'equipment_name') {
      const selectedTool = tools.find(t => t.equipment_name === value);
      if (selectedTool) {
        newEquipments[index].serial_no = selectedTool.serial_no;
        newEquipments[index].condition = selectedTool.condition;
      }
    }
    
    setFormData({ ...formData, equipments: newEquipments });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one equipment
    if (formData.equipments.length === 0 || !formData.equipments[0].equipment_name) {
      toast.error('Please add at least one equipment');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/loans`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Loan created successfully');
      
      // Download PDF
      const pdfResponse = await axios.get(`${API}/loans/${response.data.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loan_${response.data.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        borrower_name: '',
        loan_date: '',
        return_date: '',
        project_name: '',
        wbs_project_no: '',
        project_location: '',
        equipments: [{ equipment_name: '', serial_no: '', condition: '' }]
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="loan-dialog" aria-describedby="loan-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Equipment Loan Form</DialogTitle>
          <p id="loan-dialog-description" className="sr-only">
            Create a new equipment loan record with borrower information and equipment details
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="borrower_name">Borrower Name *</Label>
              <Input
                id="borrower_name"
                data-testid="borrower-name-input"
                value={formData.borrower_name}
                onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan_date">Loan Date *</Label>
              <Input
                id="loan_date"
                data-testid="loan-date-input"
                type="date"
                value={formData.loan_date}
                onChange={(e) => setFormData({ ...formData, loan_date: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_date">Return Date *</Label>
              <Input
                id="return_date"
                data-testid="return-date-input"
                type="date"
                value={formData.return_date}
                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name *</Label>
              <Input
                id="project_name"
                data-testid="project-name-input"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wbs_project_no">WBS Project No. *</Label>
              <Input
                id="wbs_project_no"
                data-testid="wbs-input"
                value={formData.wbs_project_no}
                onChange={(e) => setFormData({ ...formData, wbs_project_no: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_location">Project Location *</Label>
              <Input
                id="project_location"
                data-testid="project-location-input"
                value={formData.project_location}
                onChange={(e) => setFormData({ ...formData, project_location: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Equipment (Max 5) *</Label>
              <Button
                type="button"
                onClick={addEquipment}
                disabled={formData.equipments.length >= 5}
                size="sm"
                data-testid="add-equipment-btn"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add Equipment
              </Button>
            </div>

            {formData.equipments.map((eq, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3" data-testid={`equipment-item-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Equipment {index + 1}</span>
                  {formData.equipments.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      size="sm"
                      variant="ghost"
                      data-testid={`remove-equipment-btn-${index}`}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Equipment Name *</Label>
                    <Select
                      value={eq.equipment_name}
                      onValueChange={(value) => updateEquipment(index, 'equipment_name', value)}
                    >
                      <SelectTrigger data-testid={`equipment-select-${index}`}>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]" position="popper" sideOffset={5}>
                        {tools.map((tool) => (
                          <SelectItem key={tool.id} value={tool.equipment_name}>
                            {tool.equipment_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Serial No. *</Label>
                    <Input
                      value={eq.serial_no}
                      onChange={(e) => updateEquipment(index, 'serial_no', e.target.value)}
                      required
                      data-testid={`serial-input-${index}`}
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Input
                      value={eq.condition}
                      onChange={(e) => updateEquipment(index, 'condition', e.target.value)}
                      required
                      data-testid={`condition-input-${index}`}
                      className="border-slate-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="cancel-loan-btn"
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="submit-loan-btn"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Creating...' : 'Create Loan & Download PDF'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
