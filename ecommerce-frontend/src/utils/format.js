export const money = (n)=> new Intl.NumberFormat('en-IN', {
    style:'currency',
    currency:'INR',
    maximumFractionDigits: 0
})
.format(n || 0);