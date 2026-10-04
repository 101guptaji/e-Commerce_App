import { FaGem, FaLaptop, FaTags, FaTshirt } from 'react-icons/fa';
import { GiLargeDress } from 'react-icons/gi';

// Display metadata for the categories used by the seed data. Any other category
// an admin creates falls back to a title-cased label and a generic icon.
const CATEGORY_META = {
    electronics: { label: 'Electronics', icon: FaLaptop, tagline: 'Gadgets and accessories for every day' },
    "men's clothing": { label: "Men's Clothing", icon: FaTshirt, tagline: 'Everyday essentials for him' },
    "women's clothing": { label: "Women's Clothing", icon: GiLargeDress, tagline: 'Fresh styles for every occasion' },
    jewelery: { label: 'Jewellery', icon: FaGem, tagline: 'Pieces that add a little shine' }
};

const titleCase = (value) =>
    value
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

export const getCategoryMeta = (category) => {
    const name = typeof category === 'string' ? category.trim() : '';
    const meta = CATEGORY_META[name.toLowerCase()];
    return {
        label: meta?.label ?? (name ? titleCase(name) : 'Other'),
        icon: meta?.icon ?? FaTags,
        tagline: meta?.tagline ?? 'Explore the collection'
    };
};

// The API filters categories by exact match, so always link with the raw value.
export const categoryLink = (category) => `/products?category=${encodeURIComponent(category)}`;
