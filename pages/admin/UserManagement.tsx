
import React, { useEffect, useState } from 'react';
import { Users, Edit, Trash2, Shield, Plus, UserPlus, X, Search } from 'lucide-react';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'patient' as UserRole
  });

  const fetchUsers = async () => {
      try {
          // Endpoint from new_api_need.txt
          const data = await api.get<User[]>('/admin/users/');
          setUsers(data);
          setFilteredUsers(data);
      } catch (error) {
          console.error("Failed to fetch users", error);
      }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search) {
        setFilteredUsers(users);
    } else {
        const term = search.toLowerCase();
        setFilteredUsers(users.filter(u => 
            u.username.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            (u.first_name + ' ' + u.last_name).toLowerCase().includes(term)
        ));
    }
  }, [search, users]);

  const handleOpenModal = (user?: User) => {
      if (user) {
          setEditingUser(user);
          setFormData({
              username: user.username,
              email: user.email,
              password: '', // Password usually left blank on edit
              first_name: user.first_name,
              last_name: user.last_name,
              role: user.role
          });
      } else {
          setEditingUser(null);
          setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'patient' });
      }
      setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
      if (!window.confirm("Are you sure you want to deactivate/delete this user?")) return;
      try {
          await api.delete(`/admin/users/${id}/`);
          const updated = users.filter(u => u.id !== id);
          setUsers(updated);
      } catch (e) {
          alert("Operation failed");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (editingUser) {
            // Edit User - PATCH
            // Remove password if blank to avoid resetting it
            const payload: any = { ...formData };
            if (!payload.password) delete payload.password;

            const updated = await api.patch<User>(`/admin/users/${editingUser.id}/`, payload);
            setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u));
        } else {
            // Create User - POST
            await api.post<User>('/auth/register/', formData);
            // Re-fetch users to get clean state
            fetchUsers();
        }
        setIsModalOpen(false);
    } catch (e: any) {
        alert("Operation failed: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
         <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                <p className="text-slate-500">Manage Doctors, Patients, and Admins</p>
            </div>
            <div className="flex gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <UserPlus size={18} className="mr-2" />
                    Add New User
                </Button>
            </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">User</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Role</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs uppercase">
                                        {u.username[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{u.first_name} {u.last_name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                      u.role === 'doctor' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'}`}>
                                    {u.role === 'admin' && <Shield size={10} className="mr-1"/>}
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${u.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm text-slate-600 capitalize">{u.is_active !== false ? 'Active' : 'Inactive'}</span>
                            </td>
                            <td className="px-6 py-4 flex justify-end gap-2">
                                <button 
                                    onClick={() => handleOpenModal(u)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(u.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-6 text-slate-500">No users found matching your search.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl relative">
                    <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                    <h3 className="text-xl font-bold mb-6">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                <input type="text" required className="w-full p-2 border rounded-lg" 
                                    value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                <input type="text" required className="w-full p-2 border rounded-lg" 
                                    value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" required className="w-full p-2 border rounded-lg" 
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input type="text" required className="w-full p-2 border rounded-lg" 
                                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                             <select className="w-full p-2 border rounded-lg" 
                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="admin">Admin</option>
                             </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password {editingUser && '(Leave blank to keep current)'}</label>
                            <input type="password" required={!editingUser} className="w-full p-2 border rounded-lg" 
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>{editingUser ? 'Save Changes' : 'Create User'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
