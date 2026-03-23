// src/utils/index.js

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatDate = (ts) => {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const truncate = (str, n = 80) => str.length > n ? str.slice(0, n) + '…' : str;

export const calcAvgRating = (reviews) => {
  if (!reviews?.length) return 0;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
};

export const generateOrderId = () => `ORD-${Date.now().toString(36).toUpperCase()}`;
