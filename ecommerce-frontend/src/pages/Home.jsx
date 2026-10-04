import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { FaBoxOpen, FaExclamationTriangle, FaStore, FaThLarge } from 'react-icons/fa'
import { fetchCatalog } from '../redux/slices/productSlice';
import HeroCarousel from '../components/HeroCarousel';
import ProductSection from '../components/ProductSection';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '../components/Skeletons';
import { categoryLink, getCategoryMeta } from '../utils/categories';
import '../styles/homeStyle.css'

const SLIDE_THEMES = ['crimson', 'noir', 'ember', 'wine', 'graphite'];
const SECTION_SIZE = 12;

const Home = () => {
  const dispatch = useDispatch();
  const { catalog, categories, catalogStatus, catalogError } = useSelector(state => state.products);
  const role = useSelector(state => state.auth.role);
  const loading = (catalogStatus === 'idle' || catalogStatus === 'loading') && catalog.length === 0;

  // One banner per category, using a real product image from that category.
  const slides = useMemo(() => {
    const categorySlides = categories.slice(0, 5).map((category, index) => {
      const meta = getCategoryMeta(category);
      const image = catalog.find((p) => p.category === category && p.image)?.image;
      return {
        id: category,
        eyebrow: 'Featured category',
        title: meta.label,
        text: meta.tagline,
        to: categoryLink(category),
        image,
        icon: meta.icon,
        theme: SLIDE_THEMES[index % SLIDE_THEMES.length],
      };
    });
    if (categorySlides.length) return categorySlides;
    return [{
      id: 'all',
      eyebrow: 'Welcome to HG Shop',
      title: 'Everything you need, in one place',
      text: 'Browse the full catalogue with free delivery on every order.',
      to: '/products',
      icon: FaStore,
      theme: 'crimson',
    }];
  }, [catalog, categories]);

  // The API returns newest products first.
  const latest = useMemo(() => catalog.slice(0, SECTION_SIZE), [catalog]);

  const sections = useMemo(() => categories
    .map((category) => ({
      category,
      products: catalog.filter((p) => p.category === category).slice(0, SECTION_SIZE),
    }))
    .filter((section) => section.products.length > 0), [catalog, categories]);

  let content;
  if (catalogStatus === 'failed' && catalog.length === 0) {
    content = (
      <EmptyState
        className="card home__state"
        icon={FaExclamationTriangle}
        title="We couldn't load products"
        message={catalogError || 'Please check your connection and try again.'}
        action={<button type="button" className="btn btn-primary" onClick={() => dispatch(fetchCatalog())}>Try again</button>}
      />
    );
  } else if (!loading && catalog.length === 0) {
    content = (
      <EmptyState
        className="card home__state"
        icon={FaBoxOpen}
        title="No products yet"
        message="New products will show up here as soon as they are added."
        action={role === 'admin' ? <Link to="/admin" className="btn btn-primary">Add products</Link> : null}
      />
    );
  } else {
    content = (
      <>
        <ProductSection
          title="Latest arrivals"
          subtitle="Newest additions to the store"
          products={latest}
          loading={loading}
          viewAllTo="/products"
        />
        {sections.map(({ category, products }) => {
          const { label } = getCategoryMeta(category);
          return (
            <ProductSection
              key={category}
              title={`Best of ${label}`}
              subtitle={`Newest in ${label}`}
              products={products}
              viewAllTo={categoryLink(category)}
            />
          );
        })}
      </>
    );
  }

  return (
    <div className='home'>
      <nav className="cat-strip" aria-label="Shop by category">
        <ul className="cat-strip__list no-scrollbar">
          <li>
            <Link to="/products" className="cat-strip__item">
              <span className="cat-strip__icon cat-strip__icon--all" aria-hidden="true"><FaThLarge /></span>
              <span className="cat-strip__label">All Products</span>
            </Link>
          </li>
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <li key={index} className="cat-strip__item" aria-hidden="true">
                  <Skeleton width={60} height={60} radius={20} />
                  <Skeleton width={72} height={12} />
                </li>
              ))
            : categories.map((category) => {
                const { label, icon: Icon } = getCategoryMeta(category);
                return (
                  <li key={category}>
                    <Link to={categoryLink(category)} className="cat-strip__item">
                      <span className="cat-strip__icon" aria-hidden="true"><Icon /></span>
                      <span className="cat-strip__label">{label}</span>
                    </Link>
                  </li>
                );
              })}
        </ul>
      </nav>

      <div className="page home__content">
        {loading ? (
          <div className="hero hero--skeleton" aria-hidden="true">
            <span className="skeleton" />
          </div>
        ) : (
          <HeroCarousel slides={slides} />
        )}
        {content}
      </div>
    </div>
  )
}

export default Home
