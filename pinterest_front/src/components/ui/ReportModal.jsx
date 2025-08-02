import React, { useState } from 'react';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, onSubmit, pinId, pinTitle }) => {
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportMessage.trim()) {
      alert('Будь ласка, введіть текст скарги');
      return;
    }
    
    if (reportMessage.trim().length < 10) {
      alert('Текст скарги повинен містити мінімум 10 символів');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(pinId, reportMessage);
      setReportMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Помилка при відправці скарги. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReportMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={handleClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>Повідомити про пін</h2>
          <button 
            className="report-modal-close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="report-modal-content">
          <p className="report-modal-description">
            Повідомте нам, що вас не влаштовує в цьому піні. Ми розглянемо вашу скаргу.
          </p>
          
          <form onSubmit={handleSubmit} className="report-modal-form">
            <div className="report-modal-field">
              <label htmlFor="reportMessage">Текст скарги:</label>
              <textarea
                id="reportMessage"
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                placeholder="Опишіть проблему з цим піном..."
                rows="5"
                required
                disabled={isSubmitting}
                maxLength="1000"
              />
              <div className="report-modal-char-count">
                {reportMessage.length}/1000 символів
                {reportMessage.trim().length > 0 && reportMessage.trim().length < 10 && (
                  <span style={{ color: 'red', marginLeft: '10px' }}>
                    Мінімум 10 символів
                  </span>
                )}
              </div>
            </div>
            
            <div className="report-modal-actions">
              <button 
                type="button" 
                className="report-modal-cancel"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className="report-modal-submit"
                disabled={isSubmitting || !reportMessage.trim() || reportMessage.trim().length < 10}
              >
                {isSubmitting ? 'Відправка...' : 'Відправити скаргу'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal; 