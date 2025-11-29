import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { MedicalDocument, User } from '../types';
import { FileText, Download, Upload, Trash2, Loader2, BrainCircuit, CheckCircle, Clock, ChevronDown, ChevronUp, User as UserIcon, Sparkles, XCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const Documents = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<MedicalDocument[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>(''); // For AI feedback steps
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // View State
  const [expandedDocId, setExpandedDocId] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert file to Base64 for localStorage persistence
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Load documents from LocalStorage to simulate persistent backend for SaaS demo
  const fetchDocs = async () => {
    try {
      const storedDocs = localStorage.getItem('dawini_documents');
      if (storedDocs) {
        setDocs(JSON.parse(storedDocs));
      } else {
        // Initial mock data if empty
        const initialDocs: MedicalDocument[] = [
           {
              id: 1,
              title: 'Blood Test Results.pdf',
              document_type: 'Lab Report',
              uploaded_at: new Date(Date.now() - 86400000).toISOString(),
              doctor_id: 2,
              doctor_name: 'Smith',
              status: 'approved',
              ai_summary: 'Hemoglobin levels are normal (14.5 g/dL). White blood cell count is slightly elevated.',
              ai_tips: 'Monitor for any symptoms of infection. Repeat test in 2 weeks.'
           }
        ];
        setDocs(initialDocs);
        localStorage.setItem('dawini_documents', JSON.stringify(initialDocs));
      }
    } catch(e) { console.error(e); }
  };

  const fetchDoctors = async () => {
    try {
        const data = await api.get<User[]>('/auth/doctors/');
        setDoctors(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchDocs();
    fetchDoctors();
    
    // Listen for storage events to update real-time if doctor updates in another tab
    const handleStorageChange = () => fetchDocs();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const file = fileInputRef.current?.files?.[0];
      if (!file || !selectedDoctorId) {
          alert("Please select a file and a doctor.");
          return;
      }

      setIsUploading(true);
      try {
          // 1. Upload Phase
          setUploadStep('Uploading document...');
          // Convert to Base64 for persistence
          const base64File = await fileToBase64(file);
          
          await new Promise(resolve => setTimeout(resolve, 800));

          // 2. Extraction Phase
          setUploadStep('AI extracting data points...');
          await new Promise(resolve => setTimeout(resolve, 1200));

          // 3. Analysis Phase
          setUploadStep('Generating health insights & tips...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const docName = doctors.find(d => d.id === parseInt(selectedDoctorId))?.last_name || 'Unknown';
          
          const mockNewDoc: MedicalDocument = {
              id: Date.now(),
              title: file.name,
              document_type: 'Lab Result',
              uploaded_at: new Date().toISOString(),
              file: base64File, // Store base64 string
              doctor_id: parseInt(selectedDoctorId),
              doctor_name: docName,
              patient_name: user?.username || 'Me', // For doctor view
              status: 'pending',
              ai_summary: "AI Analysis: The document contains metabolic panel results. Glucose levels are 105 mg/dL (Pre-diabetic range). Cholesterol is 190 mg/dL.",
              ai_tips: "1. Reduce sugar intake.\n2. Incorporate 30 mins of cardio daily.\n3. Schedule consultation for diet planning."
          };

          const updatedDocs = [mockNewDoc, ...docs];
          setDocs(updatedDocs);
          localStorage.setItem('dawini_documents', JSON.stringify(updatedDocs));
          
          setIsUploadModalOpen(false);
          alert("Document uploaded and analyzed! Sent to Dr. " + docName + " for review.");
      } catch (error) {
          console.error(error);
          alert("Failed to upload document.");
      } finally {
          setIsUploading(false);
          setUploadStep('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setSelectedDoctorId('');
      }
  };

  const handleDelete = async (id: number) => {
      if(!window.confirm("Are you sure you want to delete this document?")) return;
      const updatedDocs = docs.filter(d => d.id !== id);
      setDocs(updatedDocs);
      localStorage.setItem('dawini_documents', JSON.stringify(updatedDocs));
  };

  const toggleExpand = (id: number) => {
      setExpandedDocId(expandedDocId === id ? null : id);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Medical Documents</h2>
                <p className="text-slate-500">AI-analyzed reports and doctor reviews</p>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload size={18} className="mr-2"/> Upload & Analyze
            </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-6 py-4 font-semibold text-slate-700 text-sm">
                <div className="col-span-4">Document Name</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Assigned Doctor</div>
                <div className="col-span-2">AI Status</div>
                <div className="col-span-1 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-slate-100">
                {docs.map(doc => (
                    <div key={doc.id} className="transition-colors hover:bg-slate-50">
                        {/* Main Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center gap-4">
                            <div className="col-span-4 flex items-center gap-3 cursor-pointer" onClick={() => toggleExpand(doc.id)}>
                                <div className={`p-2 rounded-lg ${doc.status === 'approved' ? 'bg-teal-100 text-teal-600' : doc.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <span className="font-medium text-slate-900 block">{doc.title}</span>
                                    <span className="text-xs text-slate-500 md:hidden">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="col-span-2 hidden md:block text-slate-500 text-sm">
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                            </div>

                            <div className="col-span-3 text-sm text-slate-600 flex items-center gap-1">
                                <UserIcon size={14} /> Dr. {doc.doctor_name || doc.doctor_id || 'Unassigned'}
                            </div>

                            <div className="col-span-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase border ${
                                    doc.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    doc.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {doc.status === 'approved' && <CheckCircle size={12} />}
                                    {doc.status === 'pending' && <Clock size={12} />}
                                    {doc.status === 'rejected' && <XCircle size={12} />}
                                    {doc.status}
                                </span>
                            </div>

                            <div className="col-span-1 flex justify-end gap-2">
                                {doc.file && (
                                    <a 
                                      href={doc.file} 
                                      download={doc.title}
                                      className="p-2 hover:bg-slate-200 rounded-full text-slate-500"
                                      onClick={(e) => e.stopPropagation()}
                                      title="Download Original"
                                    >
                                        <Download size={18} />
                                    </a>
                                )}
                                <button onClick={() => toggleExpand(doc.id)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                                    {expandedDocId === doc.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-full">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Details (AI & Tips) */}
                        {expandedDocId === doc.id && (
                            <div className="bg-slate-50 px-6 py-6 border-t border-slate-100 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <BrainCircuit size={64} className="text-indigo-600"/>
                                        </div>
                                        <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-3">
                                            <BrainCircuit size={18} /> AI Analysis
                                        </h4>
                                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                            {doc.ai_summary || "Processing analysis..."}
                                        </p>
                                    </div>
                                    <div className={`bg-white p-5 rounded-xl border shadow-sm relative overflow-hidden ${doc.status === 'approved' ? 'border-teal-100' : 'border-slate-100'}`}>
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <CheckCircle size={64} className={doc.status === 'approved' ? "text-teal-600" : "text-slate-400"}/>
                                        </div>
                                        <h4 className={`flex items-center gap-2 font-bold mb-3 ${doc.status === 'approved' ? 'text-teal-900' : 'text-slate-700'}`}>
                                            <Sparkles size={18} /> Recommendations / Tips
                                            {doc.status === 'approved' && (
                                                <span className="text-xs font-normal text-white bg-teal-600 px-2 py-0.5 rounded-full ml-auto">Verified by Dr. {doc.doctor_name}</span>
                                            )}
                                        </h4>
                                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                            {doc.ai_tips || "No specific recommendations generated."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {docs.length === 0 && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Upload size={32} className="text-slate-400"/>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No documents yet</h3>
                        <p>Upload a medical record to get instant AI insights.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl relative">
                    <h3 className="text-xl font-bold mb-2">Upload & Analyze</h3>
                    <p className="text-sm text-slate-500 mb-6">Our AI will scan your document for key health indicators.</p>
                    
                    {!isUploading ? (
                        <form onSubmit={handleUploadSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Document</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden"
                                        required
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            // Force re-render or feedback if needed
                                        }}
                                    />
                                    <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                    <p className="text-sm text-slate-600">Click to browse files</p>
                                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG supported</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Assign Doctor for Verification</label>
                                <select 
                                    className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    required
                                >
                                    <option value="">Choose a doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.last_name} ({d.first_name})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="secondary" type="button" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Start Analysis</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <div className="relative w-16 h-16 mx-auto">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                                <BrainCircuit className="absolute inset-0 m-auto text-teal-600 animate-pulse" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">AI Processing</h4>
                                <p className="text-teal-600 font-medium animate-pulse">{uploadStep}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};