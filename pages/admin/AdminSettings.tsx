
import React, { useState, useEffect } from 'react';
import { Save, Shield, Server, Bell, Lock, Smartphone, RefreshCw, Trash2, Cpu } from 'lucide-react';
import { Button } from '../../components/Button';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState({ db: 'Connected', ai: 'Operational' });
  
  const [settings, setSettings] = useState({
    systemName: 'Dawini SaaS',
    supportEmail: 'support@dawini.health',
    maintenanceMode: false,
    allowRegistration: true,
    enforce2FA: false,
    sessionTimeout: 30,
    aiConfidenceThreshold: 0.85,
    enableBetaFeatures: false
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem('admin_settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    setLoading(false);
    alert("System configuration saved successfully.");
  };

  const clearSystemLogs = () => {
    if(window.confirm("Are you sure you want to clear all system logs? This cannot be undone.")) {
      sessionStorage.removeItem('system_logs');
      alert("System logs cleared.");
    }
  };

  const handleResetAICache = async () => {
    if(!window.confirm("Resetting AI models cache will require them to reload on next request. Continue?")) return;
    setCacheLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCacheLoading(false);
    alert("AI Cache reset successfully.");
  };

  const refreshSystemHealth = async () => {
      setHealthLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      // Randomize statuses slightly to simulate check
      setHealthStatus({
          db: Math.random() > 0.1 ? 'Connected' : 'Latency High',
          ai: 'Operational'
      });
      setHealthLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">System Configuration</h2>
        <p className="text-slate-500">Manage global settings, security policies, and AI parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Navigation/Summary (Simplified for this view to be single scroll) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Settings */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Server size={20} className="text-slate-500" /> General Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Name</label>
                <input 
                  type="text" 
                  name="systemName"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-400"
                  value={settings.systemName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Support Contact Email</label>
                <input 
                  type="email" 
                  name="supportEmail"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-400"
                  value={settings.supportEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center justify-between py-2 group">
                <div>
                  <label className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">Maintenance Mode</label>
                  <p className="text-xs text-slate-500">Disable access for non-admin users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-slate-500" /> Security & Access
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 group">
                <div>
                  <label className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">Allow New Registrations</label>
                  <p className="text-xs text-slate-500">If disabled, only admins can create users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2 group">
                <div>
                  <label className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">Enforce 2FA for Staff</label>
                  <p className="text-xs text-slate-500">Require Two-Factor Auth for Doctors and Admins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="enforce2FA" checked={settings.enforce2FA} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Session Timeout (minutes)</label>
                <input 
                  type="number" 
                  name="sessionTimeout"
                  className="w-full md:w-32 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-400"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* AI Configuration */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Cpu size={20} className="text-slate-500" /> AI Model Parameters
            </h3>
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-slate-700">Risk Prediction Confidence Threshold</label>
                    <span className="text-sm font-bold text-blue-600">{settings.aiConfidenceThreshold}</span>
                  </div>
                  <input 
                    type="range" 
                    name="aiConfidenceThreshold"
                    min="0.5" 
                    max="0.99" 
                    step="0.01"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:bg-slate-300 transition-colors"
                    value={settings.aiConfidenceThreshold}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-slate-500 mt-1">Predictions below this score will be flagged for human review.</p>
               </div>

               <div className="flex items-center justify-between py-2 group">
                <div>
                  <label className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">Enable Beta Features</label>
                  <p className="text-xs text-slate-500">Access to experimental diagnostic models</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="enableBetaFeatures" checked={settings.enableBetaFeatures} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
             <Button onClick={handleSave} isLoading={loading} className="px-8 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-shadow">
                <Save size={18} className="mr-2" /> Save Configuration
             </Button>
          </div>

        </div>

        {/* Right Column - Status/Actions */}
        <div className="space-y-6">
           <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Server size={64} />
               </div>
               <div className="flex justify-between items-center mb-4 relative z-10">
                   <h3 className="font-bold">System Health</h3>
                   <button 
                     onClick={refreshSystemHealth}
                     className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white ${healthLoading ? 'animate-spin text-blue-400' : ''}`}
                     title="Refresh Status"
                   >
                       <RefreshCw size={16} />
                   </button>
               </div>
               <div className="space-y-3 text-sm relative z-10">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                     <span className="text-slate-400">Database</span>
                     <span className={`font-medium transition-colors duration-500 ${healthStatus.db === 'Connected' ? 'text-green-400' : 'text-yellow-400'}`}>
                         {healthStatus.db}
                     </span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                     <span className="text-slate-400">AI Engine</span>
                     <span className="text-green-400 font-medium">{healthStatus.ai}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                     <span className="text-slate-400">Storage</span>
                     <span className="text-yellow-400 font-medium">85% Used</span>
                  </div>
                  <div className="flex justify-between pt-1">
                     <span className="text-slate-400">Version</span>
                     <span className="text-white">v2.4.0-saas</span>
                  </div>
               </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 hover:border-red-200 hover:shadow-md transition-all">
               <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                   <Lock size={18} /> Danger Zone
               </h3>
               <div className="space-y-3">
                  <Button variant="secondary" onClick={clearSystemLogs} className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200 transition-colors">
                      <Trash2 size={16} className="mr-2" /> Clear System Logs
                  </Button>
                  <Button variant="secondary" onClick={handleResetAICache} isLoading={cacheLoading} className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200 transition-colors">
                      <RefreshCw size={16} className={`mr-2 ${cacheLoading ? 'animate-spin' : ''}`} /> Reset AI Cache
                  </Button>
               </div>
           </div>
        </div>

      </div>
    </div>
  );
};
