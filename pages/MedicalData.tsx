import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MedicalRecord } from '../types';
import { Activity, Plus, Heart, Droplet, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '../components/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const MedicalData = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    glucose: '',
    heart_rate: '',
    notes: ''
  });

  const fetchRecords = async () => {
    try {
      const data = await api.get<MedicalRecord[]>('/records/');
      setRecords(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenModal = (record?: MedicalRecord) => {
      if (record) {
          setEditingId(record.id);
          setFormData({
              systolic: record.systolic.toString(),
              diastolic: record.diastolic.toString(),
              glucose: record.glucose.toString(),
              heart_rate: record.heart_rate.toString(),
              notes: record.notes || ''
          });
      } else {
          setEditingId(null);
          setFormData({ systolic: '', diastolic: '', glucose: '', heart_rate: '', notes: '' });
      }
      setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this record?")) return;
      try {
          await api.delete(`/records/${id}/`);
          setRecords(prev => prev.filter(r => r.id !== id));
      } catch (e) {
          alert("Failed to delete record");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const payload = {
            systolic: parseInt(formData.systolic),
            diastolic: parseInt(formData.diastolic),
            glucose: parseInt(formData.glucose),
            heart_rate: parseInt(formData.heart_rate),
            notes: formData.notes
        };

        if (editingId) {
            const updated = await api.put<MedicalRecord>(`/records/${editingId}/`, payload);
            setRecords(prev => prev.map(r => r.id === editingId ? updated : r));
        } else {
            const created = await api.post<MedicalRecord>('/records/', payload);
            setRecords(prev => [created, ...prev]);
        }
        setIsModalOpen(false);
    } catch (e) {
        alert(`Failed to ${editingId ? 'update' : 'create'} record`);
    } finally {
        setIsLoading(false);
    }
  };

  // Sort for chart (ascending date)
  const chartData = [...records].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(r => ({
      date: new Date(r.created_at).toLocaleDateString(),
      systolic: r.systolic,
      diastolic: r.diastolic,
      glucose: r.glucose,
      hr: r.heart_rate
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
          <div>
              <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
              <p className="text-slate-500">History of your vital signs</p>
          </div>
          <Button onClick={() => handleOpenModal()}><Plus size={16} className="mr-2"/> Add Measurement</Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-red-500"/> Blood Pressure
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Droplet size={20} className="text-yellow-500"/> Glucose & Heart Rate
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="glucose" stroke="#eab308" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">BP (mmHg)</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Glucose</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">HR (bpm)</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Notes</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {records.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 text-sm">{new Date(rec.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-600">{rec.systolic}/{rec.diastolic}</td>
                        <td className="px-6 py-4 text-slate-600">{rec.glucose}</td>
                        <td className="px-6 py-4 text-slate-600">{rec.heart_rate}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm italic">{rec.notes || '-'}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleOpenModal(rec)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(rec.id)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {records.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No records found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Measurement' : 'Add New Measurement'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Systolic BP</label>
                        <input type="number" className="w-full p-2 border rounded-lg" required value={formData.systolic} onChange={e => setFormData({...formData, systolic: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Diastolic BP</label>
                        <input type="number" className="w-full p-2 border rounded-lg" required value={formData.diastolic} onChange={e => setFormData({...formData, diastolic: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Glucose</label>
                        <input type="number" className="w-full p-2 border rounded-lg" required value={formData.glucose} onChange={e => setFormData({...formData, glucose: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Heart Rate</label>
                        <input type="number" className="w-full p-2 border rounded-lg" required value={formData.heart_rate} onChange={e => setFormData({...formData, heart_rate: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea className="w-full p-2 border rounded-lg" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>{editingId ? 'Update Record' : 'Save Record'}</Button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};