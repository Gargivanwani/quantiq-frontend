import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText, Download, Upload, Trash2, Eye, Image, File } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { useNotesStore } from '../store';
import { PageWrapper } from '../components/AppShell';

const allTopics = curriculum.flatMap(path =>
  path.topics.map(t => ({ ...t, pathTitle: path.title, pathColor: path.color }))
);

export default function NotesEditor() {
  const [selectedTopic, setSelectedTopic] = useState(allTopics[0].id);
  const { notes, setNote, getNote, addUploadedNote, deleteUploadedNote, getUploadedNotes } = useNotesStore();
  const [content, setContent] = useState(getNote(allTopics[0].id));
  const [saved, setSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'uploaded'
  const [activePreviewFile, setActivePreviewFile] = useState(null);

  const handleSelect = (id) => {
    setSelectedTopic(id);
    setContent(getNote(id));
    setSaved(true);
  };

  const handleChange = (val) => {
    setContent(val);
    setSaved(false);
  };

  const handleSave = () => {
    setNote(selectedTopic, content);
    setSaved(true);
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleExport = () => {
    const topic = allTopics.find(t => t.id === selectedTopic);
    const blob = new Blob([`# ${topic?.title} — Notes\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic?.title.replace(/\s+/g, '_')}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileObj = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          date: new Date().toLocaleDateString(),
          dataUrl: reader.result // Base64 data string
        };
        addUploadedNote(selectedTopic, fileObj);
      };
      reader.readAsDataURL(file);
    });
  };

  const currentTopic = allTopics.find(t => t.id === selectedTopic);
  const noteCount = Object.keys(notes).filter(k => notes[k]?.content?.trim()).length;
  const uploadedNotesList = getUploadedNotes(selectedTopic);

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Notes</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Personal notes per topic · {noteCount} notes saved
            </p>
          </div>
          {activeTab === 'text' && (
            <div className="flex gap-2">
              <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
                <Download size={15} /> Export
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm"
                style={saved ? { opacity: 0.6 } : {}}>
                <Save size={15} /> {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Topic Sidebar */}
          <aside className="hidden md:flex flex-col w-52 flex-shrink-0 gap-1 overflow-y-auto pr-1">
            {curriculum.map(path => (
              <div key={path.id} className="mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide px-2 py-1 mb-1"
                  style={{ color: path.color }}>
                  {path.icon} {path.title}
                </p>
                {path.topics.map(topic => {
                  const hasNote = notes[topic.id]?.content?.trim();
                  const uploadedList = getUploadedNotes(topic.id);
                  const hasUploaded = uploadedList.length > 0;
                  return (
                    <button key={topic.id} onClick={() => handleSelect(topic.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2"
                      style={{
                        background: selectedTopic === topic.id ? `${path.color}20` : 'transparent',
                        color: selectedTopic === topic.id ? path.color : 'var(--text-muted)',
                        border: selectedTopic === topic.id ? `1px solid ${path.color}30` : '1px solid transparent',
                      }}>
                      <FileText size={12} style={{ flexShrink: 0 }} />
                      <span className="truncate">{topic.title}</span>
                      <div className="flex gap-1 items-center ml-auto flex-shrink-0">
                        {hasUploaded && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} title={`${uploadedList.length} attachment(s)`} />}
                        {hasNote && <div className="w-1.5 h-1.5 rounded-full" style={{ background: path.color }} title="Written notes exist" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>

          {/* Mobile topic select */}
          <div className="md:hidden w-full mb-2">
            <select className="input-field w-full" value={selectedTopic} onChange={e => handleSelect(e.target.value)}>
              {allTopics.map(t => <option key={t.id} value={t.id}>{t.pathTitle} → {t.title}</option>)}
            </select>
          </div>

          {/* Editor & Upload View Container */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tabs */}
            <div className="flex border-b mb-3" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setActiveTab('text')}
                className="px-4 py-2 border-b-2 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                style={{
                  borderColor: activeTab === 'text' ? 'var(--accent-gold)' : 'transparent',
                  color: activeTab === 'text' ? 'var(--accent-gold)' : 'var(--text-muted)'
                }}
              >
                <FileText size={13} /> Written Notes
              </button>
              <button
                onClick={() => setActiveTab('uploaded')}
                className="px-4 py-2 border-b-2 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                style={{
                  borderColor: activeTab === 'uploaded' ? 'var(--accent-gold)' : 'transparent',
                  color: activeTab === 'uploaded' ? 'var(--accent-gold)' : 'var(--text-muted)'
                }}
              >
                <Upload size={13} /> Handwritten / Scanned Notes ({uploadedNotesList.length})
              </button>
            </div>

            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div>
                <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{currentTopic?.title}</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentTopic?.pathTitle}</p>
              </div>
              {activeTab === 'text' && (
                <div className="flex items-center gap-2">
                  {!saved && <span className="text-xs" style={{ color: 'var(--accent-gold)' }}>● Unsaved</span>}
                  {saved && lastSaved && <span className="text-xs" style={{ color: '#10b981' }}>✓ Saved {lastSaved}</span>}
                </div>
              )}
            </div>

            {activeTab === 'text' ? (
              <div className="flex-1 flex flex-col min-w-0">
                <textarea
                  className="flex-1 rounded-xl p-4 text-sm font-mono resize-none outline-none transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.7,
                  }}
                  placeholder={`Write your notes for "${currentTopic?.title}" here...\n\nTips:\n• Use markdown-style formatting\n• Add key formulas in LaTeX notation: $\\sigma = \\sqrt{Var(X)}$\n• Note down derivations and insights\n• Add exam tips and gotchas`}
                  value={content}
                  onChange={e => handleChange(e.target.value)}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); } }}
                />

                <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{content.length} characters · {content.split(/\s+/).filter(Boolean).length} words</span>
                  <span>Ctrl/⌘ + S to save</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-1">
                {/* Drag & Drop Zone */}
                <div
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors bg-opacity-10 mb-5 flex flex-col items-center justify-center"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'rgba(59,130,246,0.02)',
                  }}
                  onClick={() => document.getElementById('file-upload-input').click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    handleFileUpload(e);
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <input
                    type="file"
                    id="file-upload-input"
                    className="hidden"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                  />
                  <Upload size={32} style={{ color: 'var(--text-muted)' }} className="mb-3" />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Drag & drop handwritten scans here, or <span style={{ color: 'var(--accent-gold)' }} className="hover:underline">browse</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Supports PDF, PNG, JPG, JPEG files</p>
                </div>

                {/* Document Grid */}
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                    Uploaded Scans & Documents ({uploadedNotesList.length})
                  </h3>
                  
                  {uploadedNotesList.length === 0 ? (
                    <div className="card p-8 text-center flex flex-col items-center justify-center h-48">
                      <File size={32} style={{ color: 'var(--text-muted)' }} className="mb-2" />
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        No handwritten notes uploaded.
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Upload your tablet scribbles or camera photos to keep them side-by-side with your study.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {uploadedNotesList.map(note => {
                        const isImage = note.type.startsWith('image/');
                        return (
                          <div key={note.id} className="card p-3 flex items-center gap-3 relative hover:border-gray-500 transition-colors">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: isImage ? 'rgba(59,130,246,0.1)' : 'rgba(244,63,94,0.1)' }}>
                              {isImage ? <Image size={18} className="text-blue-400" /> : <File size={18} className="text-red-400" />}
                            </div>
                            <div className="flex-1 min-w-0 pr-16">
                              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{note.name}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{note.size} · {note.date}</p>
                            </div>
                            <div className="absolute right-3 flex items-center gap-1.5">
                              <button
                                onClick={() => setActivePreviewFile(note)}
                                title="View Scan"
                                className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => deleteUploadedNote(selectedTopic, note.id)}
                                title="Delete Scan"
                                className="p-1.5 rounded-lg hover:bg-red-950 transition-colors text-gray-400 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {activePreviewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="font-bold text-sm truncate pr-4 text-white">
                Preview: {activePreviewFile.name}
              </h3>
              <button
                onClick={() => setActivePreviewFile(null)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-xs font-semibold text-white"
              >
                Close Preview
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-gray-950 min-h-[300px]">
              {activePreviewFile.type.startsWith('image/') ? (
                <img
                  src={activePreviewFile.dataUrl}
                  alt={activePreviewFile.name}
                  className="max-w-full max-h-[68vh] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <object
                  data={activePreviewFile.dataUrl}
                  type={activePreviewFile.type}
                  className="w-full h-[68vh] rounded-lg"
                >
                  <div className="text-center p-8 text-sm text-gray-400">
                    <p className="mb-3">Direct preview is not supported for this document.</p>
                    <a
                      href={activePreviewFile.dataUrl}
                      download={activePreviewFile.name}
                      className="btn-primary inline-flex items-center gap-2 text-xs"
                    >
                      <Download size={12} /> Download PDF to View
                    </a>
                  </div>
                </object>
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
