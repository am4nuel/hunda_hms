import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import * as api from '@/api';
import { toast } from "sonner";

const BankManagement = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    accountHolder: '',
    active: true
  });

  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  const hotelId = profile.user?.hotelId;

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await api.getBanks(hotelId);
      setBanks(response.data);
    } catch (error) {
      toast.error("Failed to fetch banks");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (bank = null) => {
    if (bank) {
      setEditingBank(bank);
      setFormData({
        name: bank.name,
        accountNumber: bank.accountNumber,
        accountHolder: bank.accountHolder,
        active: bank.active
      });
    } else {
      setEditingBank(null);
      setFormData({
        name: '',
        accountNumber: '',
        accountHolder: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await api.updateBank(editingBank.id, formData);
        toast.success("Bank updated successfully");
      } else {
        await api.createBank({ ...formData, hotelId });
        toast.success("Bank added successfully");
      }
      setIsModalOpen(false);
      fetchBanks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bank?")) {
      try {
        await api.deleteBank(id);
        toast.success("Bank deleted successfully");
        fetchBanks();
      } catch (error) {
        toast.error("Failed to delete bank");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Bank <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Configure hotel bank accounts & payment channels</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-lg"
        >
          <Plus size={20} />
          Add New Bank
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[var(--theme-border)] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[var(--theme-bg)] border-b border-[var(--theme-border)]">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-light)]">Bank Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-light)]">Account Number</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-light)]">Account Holder</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-light)]">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-light)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--theme-border)]">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-[var(--theme-text-light)]">Loading banks...</td>
              </tr>
            ) : banks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-[var(--theme-text-light)]">No banks added yet</td>
              </tr>
            ) : (
              banks.map((bank) => (
                <tr key={bank.id} className="hover:bg-[var(--theme-bg)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--theme-primary-light)] text-[var(--theme-primary)] rounded-lg">
                        <Building2 size={18} />
                      </div>
                      <span className="font-medium text-[var(--theme-text)]">{bank.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--theme-text)] font-mono">{bank.accountNumber}</td>
                  <td className="px-6 py-4 text-[var(--theme-text)]">{bank.accountHolder}</td>
                  <td className="px-6 py-4">
                    {bank.active ? (
                      <span className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
                        <CheckCircle2 size={16} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
                        <XCircle size={16} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(bank)}
                        className="p-2 text-[var(--theme-text-light)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(bank.id)}
                        className="p-2 text-[var(--theme-text-light)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[var(--theme-border)] shadow-2xl overflow-hidden scale-in">
            <div className="px-6 py-4 border-b border-[var(--theme-border)] flex justify-between items-center bg-[var(--theme-bg)]">
              <h2 className="text-xl font-bold text-[var(--theme-text)]">
                {editingBank ? 'Edit Bank' : 'Add New Bank'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-[var(--theme-border)] rounded-full text-[var(--theme-text-light)]"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-light)] mb-1.5">Bank Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  className="w-full bg-[var(--theme-bg)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-light)] mb-1.5">Account Number</label>
                <input
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="1000..."
                  className="w-full bg-[var(--theme-bg)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition-all font-mono"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-light)] mb-1.5">Account Holder Name</label>
                <input
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  placeholder="Official Hotel Name"
                  className="w-full bg-[var(--theme-bg)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--theme-border)] text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
                />
                <label htmlFor="active" className="text-sm font-medium text-[var(--theme-text)]">Account is active and visible to guests</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-[var(--theme-border)] text-[var(--theme-text)] rounded-lg hover:bg-[var(--theme-bg)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[var(--theme-primary)] text-white rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-lg"
                >
                  {editingBank ? 'Save Changes' : 'Add Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankManagement;
