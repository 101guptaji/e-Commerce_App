const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

export const money = (n) => inrFormatter.format(Number(n) || 0);

export const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', options);
};
