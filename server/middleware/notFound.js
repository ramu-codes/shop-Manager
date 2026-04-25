const notFound = (req, res) => {
  res.status(404).json({ message: 'Resource not found' });
};

export default notFound;
