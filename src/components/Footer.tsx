import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>CÓDICE STORE</h3>
          <p>Distribución segura de licencias y perfiles digitales[span_9](start_span)[span_9](end_span).</p>
        </div>
        <div className="footer-info">
          <span>© {new Date().getFullYear()} - Bolivia</span>
          <span className="footer-link">Soporte Antifraude</span>
        </div>
      </div>
    </footer>
  );
};
