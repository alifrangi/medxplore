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
    if (fileType.includes('image')) return 'images';
    if (fileType.includes('pdf')) return 'documents';
    if (fileType.includes('video')) return 'videos';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'spreadsheets';
    if (fileName.includes('presentation') || fileType.includes('powerpoint')) return 'presentations';
    return 'other';
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
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
    } else {
      alert('Please select a file smaller than 10MB');
      e.target.value = '';
    }
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
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      // Delete from storage
      const storageRef = ref(storage, `departments/${file.storagePath}`);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, `departments/${departmentId}/files`, file.id));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
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

      <div className="coming-soon-section">
        <div className="coming-soon-card">
          <span className="material-icons-outlined">construction</span>
          <h4>Coming Soon</h4>
          <p>File sharing and management features are currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentFiles;