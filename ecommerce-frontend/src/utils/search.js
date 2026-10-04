// The API turns the search term into a MongoDB $regex, so escape regex
// metacharacters to get a literal match (and avoid server errors on input like "(").
export const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
