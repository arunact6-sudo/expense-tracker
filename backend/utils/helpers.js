const { v4: uuidv4 } = require('uuid');

const generateId = () => uuidv4();

const formatDate = (date, format = 'MM/DD/YYYY') => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY HH:mm':
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    default:
      return `${month}/${day}/${year}`;
  }
};

const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 10000) / 100;
};

const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (p - 1) * l;
  return { page: p, limit: l, skip };
};

const formatCurrency = (amount, currency = 'USD') => {
  const formatted = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    CAD: 'C$', AUD: 'A$', CNY: '¥', BRL: 'R$'
  };
  const symbol = symbols[currency] || '$';
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
};

module.exports = { generateId, formatDate, calculatePercentage, paginate, formatCurrency };
