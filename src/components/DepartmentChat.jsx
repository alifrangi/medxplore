import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWorkerAuth } from '../contexts/WorkerAuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import './DepartmentChat.css';

const DepartmentChat = ({ departmentId, departmentName }) => {
  const { worker } = useWorkerAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Subscribe to messages
    const messagesQuery = query(
      collection(db, `departments/${departmentId}/messages`),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      
      setMessages(messagesData);
      setLoading(false);
      
      // Scroll to bottom on new messages
      setTimeout(() => scrollToBottom(), 100);
    });

    return () => unsubscribe();
  }, [departmentId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userInfo = getUserInfo();
    if (!userInfo) return;

    try {
      await addDoc(collection(db, `departments/${departmentId}/messages`), {
        text: newMessage.trim(),
        userId: userInfo.id,
        userName: userInfo.name,
        userRole: userInfo.role,
        timestamp: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString();
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteDoc(doc(db, `departments/${departmentId}/messages`, messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="department-chat-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const userInfo = getUserInfo();

  return (
    <div className="department-chat-container">
      <div className="chat-header">
        <h3>{departmentName} Team Chat</h3>
        <span className="chat-member-count">
          <span className="material-icons-outlined">group</span>
          {messages.length > 0 ? `${new Set(messages.map(m => m.userId)).size} members` : 'No messages yet'}
        </span>
      </div>

      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="no-messages">
            <span className="material-icons-outlined">chat_bubble_outline</span>
            <p>Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`chat-message ${message.userId === userInfo?.id ? 'own-message' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="message-header">
                <span className="message-author">{message.userName}</span>
                <span className="message-role">{message.userRole}</span>
                <span className="message-time">{formatMessageTime(message.timestamp)}</span>
                {message.userId === userInfo?.id && (
                  <button 
                    onClick={() => handleDeleteMessage(message.id)}
                    className="message-delete-button"
                    title="Delete message"
                  >
                    <span className="material-icons-outlined">delete</span>
                  </button>
                )}
              </div>
              <div className="message-content">{message.text}</div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          maxLength={500}
        />
        <button type="submit" className="chat-send-button" disabled={!newMessage.trim()}>
          <span className="material-icons-outlined">send</span>
        </button>
      </form>
    </div>
  );
};

export default DepartmentChat;