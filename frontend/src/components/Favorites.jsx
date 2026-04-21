import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, removeFavorite, updateFavoriteComment } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();
  const [commentDrafts, setCommentDrafts] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  useEffect(() => {
    setCommentDrafts(prev => {
      const nextDrafts = {};
      favorites.forEach(book => {
        nextDrafts[book.id] = prev[book.id] ?? book.comment ?? '';
      });
      return nextDrafts;
    });
  }, [favorites]);

  const handleRemoveFavorite = async (bookId) => {
    if (!token) {
      navigate('/');
      return;
    }
    await dispatch(removeFavorite({ token, bookId }));
    dispatch(fetchFavorites(token));
  };

  const handleSaveComment = async (bookId) => {
    if (!token) {
      navigate('/');
      return;
    }
    const comment = commentDrafts[bookId] ?? '';
    await dispatch(updateFavoriteComment({ token, bookId, comment }));
    dispatch(fetchFavorites(token));
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load favorites.</div>;

  return (
    <div>
      <h2>My Favorite Books</h2>
      {favorites.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '2rem auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: '#888',
        }}>
          <p>No favorite books yet.</p>
          <p>
            Go to the <a href="/books" onClick={e => { e.preventDefault(); navigate('/books'); }}>book list</a> to add some!
          </p>
        </div>
      ) : (
        <ul>
          {favorites.map(book => (
            <li key={book.id}>
              <strong>{book.title}</strong> by {book.author}
              {' '}
              <button onClick={() => handleRemoveFavorite(book.id)}>
                Remove
              </button>
              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor={`favorite-comment-${book.id}`}>Comment:</label>
                <div>
                  <input
                    id={`favorite-comment-${book.id}`}
                    type="text"
                    value={commentDrafts[book.id] ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCommentDrafts(prev => ({ ...prev, [book.id]: value }));
                    }}
                    placeholder="Add your comment"
                    style={{ marginRight: '0.5rem', minWidth: '260px' }}
                  />
                  <button onClick={() => handleSaveComment(book.id)}>Save Comment</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
