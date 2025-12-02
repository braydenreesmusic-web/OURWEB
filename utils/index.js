// Utility functions
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const calculateDaysTogether = (startDate) => {
  const start = new Date(startDate);
  const today = new Date();
  const diff = today - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
