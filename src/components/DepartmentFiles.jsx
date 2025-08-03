import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkerAuth } from '../contexts/WorkerAuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../services/firebase';
import './DepartmentFiles.css';

const DepartmentFiles = ({ departmentId, departmentName }) => {
  const { worker } = useWorkerAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewingFile, setViewingFile] = useState(null);
  const [fileLoadError, setFileLoadError] = useState(false);

  useEffect(() => {
    // Subscribe to files
    const filesQuery = query(
      collection(db, `departments/${departmentId}/files`),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(filesQuery, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFiles(filesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [departmentId]);

  const getUserInfo = () => {
    if (worker) {
      return {
        name: `${worker.firstName} ${worker.lastName}`,
        role: 'Worker',
        id: worker.id
      };
    }
    return null;
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('video')) return 'videocam';
    if (fileType.includes('audio')) return 'audiotrack';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'table_chart';
    if (fileType.includes('document') || fileType.includes('word')) return 'description';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'slideshow';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'folder_zip';
    return 'insert_drive_file';
  };

  const getFileCategory = (fileType, fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (fileType.includes('pdf') || extension === 'pdf') return 'documents';
    if (fileType.includes('wordprocessingml') || fileType.includes('msword') || 
        extension === 'docx' || extension === 'doc') return 'documents';
    if (fileType.includes('presentation') || fileType.includes('powerpoint') || 
        extension === 'ppt' || extension === 'pptx') return 'presentations';
    
    return 'other';
  };

  const canViewFile = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    // Only allow viewing for PDFs and presentations, not DOCX files
    return ['pdf', 'ppt', 'pptx'].includes(extension);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
    ];

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'docx', 'doc', 'ppt', 'pptx'];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Only PDF, DOCX, and PPT/PPTX files are allowed');
      e.target.value = '';
      return;
    }

    // Check file size
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      alert('Please select a file smaller than 100MB');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const userInfo = getUserInfo();
    if (!userInfo) return;

    setUploading(true);

    try {
      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${departmentId}/${timestamp}_${selectedFile.name}`;
      const storageRef = ref(storage, `departments/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save file metadata to Firestore
      await addDoc(collection(db, `departments/${departmentId}/files`), {
        name: selectedFile.name,
        description: fileDescription,
        size: selectedFile.size,
        type: selectedFile.type,
        category: getFileCategory(selectedFile.type, selectedFile.name),
        url: downloadURL,
        storagePath: fileName,
        uploadedBy: userInfo.name,
        uploadedByRole: userInfo.role,
        uploadedById: userInfo.id,
        uploadedAt: serverTimestamp()
      });

      // Reset form
      setSelectedFile(null);
      setFileDescription('');
      document.getElementById('file-input').value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file) => {
    const userInfo = getUserInfo();
    
    // Check permissions at app level
    if (!isAdmin && file.uploadedById !== userInfo?.id) {
      alert('You can only delete files that you uploaded.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      // Try to delete from storage first
      try {
        const storageRef = ref(storage, `departments/${file.storagePath}`);
        await deleteObject(storageRef);
      } catch (storageError) {
        // If file doesn't exist in storage, log but continue to delete metadata
        if (storageError.code === 'storage/object-not-found') {
          console.warn('File not found in storage, removing metadata only:', file.name);
        } else {
          // For other storage errors, still try to clean up metadata
          console.warn('Storage deletion failed, continuing with metadata cleanup:', storageError.message);
        }
      }

      // Always delete from Firestore (cleanup metadata)
      await deleteDoc(doc(db, `departments/${departmentId}/files`, file.id));
      
      // Show success message
      alert('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file metadata. Please try again.');
    }
  };

  const handleViewFile = (file) => {
    setViewingFile(file);
    setFileLoadError(false);
  };

  const closeModal = () => {
    setViewingFile(null);
    setFileLoadError(false);
  };

  const handleFileLoadError = async () => {
    setFileLoadError(true);
  };

  const getViewerUrl = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
      return file.url;
    } else if (['docx', 'doc', 'ppt', 'pptx'].includes(fileExtension)) {
      // Use Office Online viewer for Office documents
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
    }
    
    return file.url;
  };

  const filteredFiles = filterCategory === 'all' 
    ? files 
    : files.filter(file => file.category === filterCategory);

  if (loading) {
    return (
      <div className="department-files-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const userInfo = getUserInfo();
  const isAdmin = false; // Workers are not admins

  return (
    <div className="department-files-container">
      <div className="files-header">
        <h3>{departmentName} Files</h3>
      </div>

      {/* Upload Section */}
      <div className="file-upload-section">
        <div className="upload-card">
          <h4>Upload File</h4>
          <p className="upload-info">Allowed formats: PDF, DOCX, PPT/PPTX (Max 100MB)</p>
          
          <div className="upload-form">
            <div className="file-input-wrapper">
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.doc,.ppt,.pptx"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <label htmlFor="file-input" className="file-input-label">
                <span className="material-icons-outlined">cloud_upload</span>
                {selectedFile ? selectedFile.name : 'Choose File'}
              </label>
            </div>

            {selectedFile && (
              <div className="file-details">
                <input
                  type="text"
                  placeholder="File description (optional)"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  disabled={uploading}
                />
                <button 
                  className="upload-btn"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="files-filter">
        <button 
          className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          All Files ({files.length})
        </button>
        <button 
          className={`filter-btn ${filterCategory === 'documents' ? 'active' : ''}`}
          onClick={() => setFilterCategory('documents')}
        >
          PDFs ({files.filter(f => f.category === 'documents').length})
        </button>
        <button 
          className={`filter-btn ${filterCategory === 'presentations' ? 'active' : ''}`}
          onClick={() => setFilterCategory('presentations')}
        >
          Presentations ({files.filter(f => f.category === 'presentations').length})
        </button>
      </div>

      {/* Files List */}
      <div className="files-grid">
        <AnimatePresence>
          {filteredFiles.length === 0 ? (
            <div className="no-files">
              <span className="material-icons-outlined">folder_open</span>
              <p>No files uploaded yet</p>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                className="file-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div className="file-icon">
                  <span className="material-icons-outlined">
                    {getFileIcon(file.type)}
                  </span>
                </div>
                
                <div className="file-info">
                  <h5>{file.name}</h5>
                  {file.description && <p className="file-description">{file.description}</p>}
                  <div className="file-meta">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploadedBy}</span>
                    <span>•</span>
                    <span>{new Date(file.uploadedAt?.toDate()).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="file-actions">
                  {canViewFile(file.name) && (
                    <button 
                      className="action-btn view"
                      onClick={() => handleViewFile(file)}
                      title="View"
                    >
                      <span className="material-icons-outlined">visibility</span>
                    </button>
                  )}
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-btn download"
                    title="Download"
                  >
                    <span className="material-icons-outlined">download</span>
                  </a>
                  {(isAdmin || file.uploadedById === userInfo?.id) && (
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(file)}
                      title="Delete"
                    >
                      <span className="material-icons-outlined">delete</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* File Viewer Modal */}
      <AnimatePresence>
        {viewingFile && (
          <motion.div 
            className="file-viewer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className="file-viewer-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="file-viewer-header">
                <div className="file-viewer-info">
                  <h3>{viewingFile.name}</h3>
                  <p>Uploaded by {viewingFile.uploadedBy} • {formatFileSize(viewingFile.size)}</p>
                </div>
                <button 
                  className="close-viewer-btn"
                  onClick={closeModal}
                  title="Close"
                >
                  <span className="material-icons-outlined">close</span>
                </button>
              </div>
              
              <div className="file-viewer-content">
                {fileLoadError ? (
                  <div className="file-load-error">
                    <span className="material-icons-outlined">error_outline</span>
                    <h4>Unable to load file</h4>
                    <p>The file "{viewingFile.name}" could not be displayed. This might happen if:</p>
                    <ul>
                      <li>The file has been deleted from storage</li>
                      <li>The file is corrupted</li>
                      <li>There's a temporary network issue</li>
                    </ul>
                    <p>You can try downloading the file directly or contact support if the problem persists.</p>
                    <button 
                      className="retry-btn"
                      onClick={() => setFileLoadError(false)}
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <iframe
                    src={getViewerUrl(viewingFile)}
                    title={viewingFile.name}
                    className="file-viewer-iframe"
                    frameBorder="0"
                    onError={handleFileLoadError}
                    onLoad={(e) => {
                      // Check if iframe failed to load content
                      setTimeout(() => {
                        try {
                          const iframe = e.target;
                          // If we can't access the iframe content or it's empty, show error
                          if (!iframe.contentWindow || iframe.contentWindow.location.href === 'about:blank') {
                            handleFileLoadError();
                          }
                        } catch (error) {
                          // CORS or other access errors are expected for cross-origin content
                          // This is normal for Office documents, so we don't show an error
                        }
                      }, 3000); // Wait 3 seconds to check if content loaded
                    }}
                  />
                )}
              </div>
              
              <div className="file-viewer-actions">
                <a 
                  href={viewingFile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="viewer-action-btn primary"
                >
                  <span className="material-icons-outlined">download</span>
                  Download
                </a>
                <button 
                  className="viewer-action-btn secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentFiles;