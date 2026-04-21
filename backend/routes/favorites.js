const express = require('express');

function createFavoritesRouter({ usersFile, booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  const ensureFavoriteComments = (user) => {
    if (!user.favoriteComments || typeof user.favoriteComments !== 'object') {
      user.favoriteComments = {};
      return true;
    }
    return false;
  };

  router.get('/', authenticateToken, (req, res) => {
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const commentsInitialized = ensureFavoriteComments(user);
    if (commentsInitialized) {
      writeJSON(usersFile, users);
    }
    const books = readJSON(booksFile);
    const favorites = books
      .filter(b => user.favorites.indexOf(b.id) !== -1)
      .map(book => ({
        ...book,
        comment: user.favoriteComments[book.id] || '',
      }));
    res.json(favorites);
  });

  router.post('/', authenticateToken, (req, res) => {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ message: 'Book ID required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    ensureFavoriteComments(user);
    if (user.favorites.indexOf(bookId) == -1) {
      user.favorites.push(bookId);
      writeJSON(usersFile, users);
    }
    res.status(200).json({ message: 'Book added to favorites' });
  });

  router.patch('/:bookId/comment', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    const { comment } = req.body;
    if (!bookId) return res.status(400).json({ message: 'Book ID required' });
    if (typeof comment !== 'string') return res.status(400).json({ message: 'Comment must be a string' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });

    ensureFavoriteComments(user);

    if (user.favorites.indexOf(bookId) === -1) {
      return res.status(404).json({ message: 'Favorite book not found' });
    }

    user.favoriteComments[bookId] = comment;
    writeJSON(usersFile, users);

    return res.status(200).json({ message: 'Favorite comment updated' });
  });

  router.delete('/:bookId', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    if (!bookId) return res.status(400).json({ message: 'Book ID required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    ensureFavoriteComments(user);

    const favoriteIndex = user.favorites.indexOf(bookId);
    if (favoriteIndex !== -1) {
      user.favorites.splice(favoriteIndex, 1);
      if (Object.prototype.hasOwnProperty.call(user.favoriteComments, bookId)) {
        delete user.favoriteComments[bookId];
      }
      writeJSON(usersFile, users);
    }

    res.status(200).json({ message: 'Book removed from favorites' });
  });

  return router;
}

module.exports = createFavoritesRouter;
