import React from 'react';
import styles from '../styles/BookDetails.module.css';

// generated-by-copilot: BookDetails component to display book information with date and summary
const BookDetails = ({ book, onClose }) => {
  if (!book) {
    return null;
  }

  return (
    <div className={styles.detailsOverlay}>
      <div className={styles.detailsContainer}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.detailsContent}>
          <h2 className={styles.title}>{book.title}</h2>
          
          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <span className={styles.label}>著者:</span>
              <span className={styles.value}>{book.author}</span>
            </div>
            
            {book.date && (
              <div className={styles.metaItem}>
                <span className={styles.label}>出版日:</span>
                <span className={styles.value}>{new Date(book.date).toLocaleDateString('ja-JP')}</span>
              </div>
            )}
          </div>

          {book.description && (
            <div className={styles.descriptionSection}>
              <h3>説明</h3>
              <p className={styles.description}>{book.description}</p>
            </div>
          )}

          {!book.date && !book.description && (
            <div className={styles.noDetails}>
              <p>詳細情報はまだ利用できません。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
