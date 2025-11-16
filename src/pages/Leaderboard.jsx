import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllWorkers } from '../services/database';
import './Leaderboard.css';

const Leaderboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const result = await getAllWorkers();

      if (result.success) {
        // Sort by points descending
        const sortedWorkers = result.workers.sort((a, b) => (b.points || 0) - (a.points || 0));
        setWorkers(sortedWorkers);
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTier = (points) => {
    if (points >= 400) return { name: 'Platinum', color: '#E5E4E2', range: '400+ XP' };
    if (points >= 250) return { name: 'Gold', color: '#FFD700', range: '250-399 XP' };
    if (points >= 100) return { name: 'Silver', color: '#C0C0C0', range: '100-249 XP' };
    return { name: 'Bronze', color: '#CD7F32', range: '0-99 XP' };
  };

  const getDepartmentName = (dept) => {
    const names = {
      'operations-logistics': 'Ops & Logs',
      'academic': 'Academia',
      'global-outreach': 'Alliances & Outreach',
      'student-engagement': 'Programs & Alliances',
      'media-communications': 'Marketing'
    };
    return names[dept] || dept;
  };

  const topTen = workers.slice(0, 10);

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      {/* Hero Section */}
      <section className="leaderboard-hero">
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <h1 className="hero-title">MedXplore Crew Lobby</h1>
            <p className="hero-subtitle">Where healthcare students become tomorrow's medical leaders.</p>
          </motion.div>
        </div>
      </section>

      {/* Top 10 Section */}
      <section className="top-ten-section">
        <div className="section-container">
          <h2 className="section-title">Top 10 Explorers</h2>
          <div className="top-three">
            {topTen.slice(0, 3).map((worker, index) => {
              const tier = getTier(worker.points || 0);
              return (
                <motion.div
                  key={worker.id}
                  className={`top-card rank-${index + 1}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="rank-badge">#{index + 1}</div>
                  <div className="member-avatar" style={{ backgroundColor: worker.profileColor || '#A9D3D8' }}>
                    {worker.firstName?.[0]}{worker.lastName?.[0]}
                  </div>
                  <h3 className="member-name">{worker.firstName} {worker.lastName}</h3>
                  <p className="member-university">JUST</p>
                  <div className="points-display">
                    <span className="points-value">{worker.points || 0}</span>
                    <span className="points-label">XP</span>
                  </div>
                  <div className="tier-badge" style={{ backgroundColor: tier.color }}>
                    {tier.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full Leaderboard Section */}
      <section className="full-leaderboard-section">
        <div className="section-container">
          <h2 className="section-title">Top 10 Explorers Leaderboard</h2>

          <div className="leaderboard-table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Member</th>
                  <th>University</th>
                  <th>Department</th>
                  <th>Points</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {topTen.map((worker, index) => {
                  const tier = getTier(worker.points || 0);
                  const rank = index + 1;

                  return (
                    <tr key={worker.id}>
                      <td className="rank-cell">#{rank}</td>
                      <td className="member-cell">
                        <div className="member-info">
                          <div className="member-avatar-small" style={{ backgroundColor: worker.profileColor || '#A9D3D8' }}>
                            {worker.firstName?.[0]}{worker.lastName?.[0]}
                          </div>
                          <span className="member-name-text">{worker.firstName} {worker.lastName}</span>
                        </div>
                      </td>
                      <td>JUST</td>
                      <td>{worker.departments?.map(d => getDepartmentName(d)).join(', ') || 'N/A'}</td>
                      <td className="points-cell">{worker.points || 0}</td>
                      <td>
                        <span className="tier-badge-small" style={{ backgroundColor: tier.color }}>
                          {tier.name}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {topTen.length === 0 && (
              <div className="no-members">
                <p>No members found in the leaderboard.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tier System Section */}
      <section className="tier-system-section">
        <div className="section-container">
          <h2 className="section-title">Tier System Explained</h2>
          <div className="tier-cards">
            <div className="tier-card bronze">
              <div className="tier-icon" style={{ backgroundColor: '#CD7F32' }}>
                <span className="material-icons-outlined">military_tech</span>
              </div>
              <h3>Bronze</h3>
              <p className="tier-range">0-99 XP</p>
            </div>
            <div className="tier-card silver">
              <div className="tier-icon" style={{ backgroundColor: '#C0C0C0' }}>
                <span className="material-icons-outlined">workspace_premium</span>
              </div>
              <h3>Silver</h3>
              <p className="tier-range">100-249 XP</p>
            </div>
            <div className="tier-card gold">
              <div className="tier-icon" style={{ backgroundColor: '#FFD700' }}>
                <span className="material-icons-outlined">emoji_events</span>
              </div>
              <h3>Gold</h3>
              <p className="tier-range">250-399 XP</p>
            </div>
            <div className="tier-card platinum">
              <div className="tier-icon" style={{ backgroundColor: '#E5E4E2' }}>
                <span className="material-icons-outlined">stars</span>
              </div>
              <h3>Platinum</h3>
              <p className="tier-range">400+ XP</p>
            </div>
          </div>
          <p className="tier-description">
            Members earn experience points (XP) by participating in events, volunteering, and contributing to MedXplore initiatives.
            As they accumulate points, they progress through four tiers: Bronze, Silver, Gold, and Platinum.
            Each tier unlocks new recognition and opportunities within the program.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Leaderboard;
