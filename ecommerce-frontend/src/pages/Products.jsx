import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaExclamationTriangle, FaSearch, FaTimes } from 'react-icons/fa'
import { fetchProducts, PRODUCTS_PAGE_SIZE } from '../redux/slices/productSlice'
import useAddToCart from '../hooks/useAddToCart'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import Breadcrumbs from '../components/Breadcrumbs'
import EmptyState from '../components/EmptyState'
import { ProductGridSkeleton } from '../components/Skeletons'
import { getCategoryMeta } from '../utils/categories'
import '../styles/productsPageStyle.css'

// "Newest First" is the API's own order. The API has no sort parameter, so the
// price options reorder the products on the current page.
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price -- Low to High' },
  { value: 'price_desc', label: 'Price -- High to Low' },
];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, pages, total, status, error, categories } = useSelector((state) => state.products);
  const { addItem, isInCart, pendingId } = useAddToCart();

  const search = (searchParams.get('search') || '').trim();
  const category = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort');
  const sort = SORT_OPTIONS.some((option) => option.value === sortParam) ? sortParam : 'newest';
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1);

  useEffect(() => {
    dispatch(fetchProducts({ page, search, category, limit: PRODUCTS_PAGE_SIZE }));
  }, [dispatch, page, search, category]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, search, category]);

  // Keep filters in the URL so results are shareable and the back button works.
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      const isDefault = value === '' || value == null
        || (key === 'page' && Number(value) === 1)
        || (key === 'sort' && value === 'newest');
      if (isDefault) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const retry = () => dispatch(fetchProducts({ page, search, category, limit: PRODUCTS_PAGE_SIZE }));

  const sortedItems = useMemo(() => {
    if (sort === 'newest') return items;
    const direction = sort === 'price_asc' ? 1 : -1;
    return [...items].sort((a, b) => direction * ((Number(a.price) || 0) - (Number(b.price) || 0)));
  }, [items, sort]);

  const categoryOptions = category && !categories.includes(category) ? [...categories, category] : categories;
  const categoryLabel = category ? getCategoryMeta(category).label : '';
  const isLoading = status === 'idle' || status === 'loading';
  const hasFilters = Boolean(search || category);
  const first = total === 0 ? 0 : (page - 1) * PRODUCTS_PAGE_SIZE + 1;
  const last = Math.min(total, page * PRODUCTS_PAGE_SIZE);

  let heading = 'All Products';
  if (search && category) heading = `Results for "${search}" in ${categoryLabel}`;
  else if (search) heading = `Results for "${search}"`;
  else if (category) heading = categoryLabel;

  const crumbs = [{ label: 'Home', to: '/' }, { label: 'Products', to: '/products' }];
  if (category) crumbs.push({ label: categoryLabel, to: search ? `/products?category=${encodeURIComponent(category)}` : undefined });
  if (search) crumbs.push({ label: `"${search}"` });

  let content;
  if (isLoading) {
    content = <ProductGridSkeleton count={8} />;
  } else if (status === 'failed') {
    content = (
      <EmptyState
        icon={FaExclamationTriangle}
        title="Something went wrong"
        message={error || 'We could not load products. Please try again.'}
        action={<button type="button" className="btn btn-primary" onClick={retry}>Try again</button>}
      />
    );
  } else if (items.length === 0 && page > 1 && total > 0) {
    content = (
      <EmptyState
        icon={FaSearch}
        title="This page is empty"
        message="There are fewer results than before. Head back to the first page."
        action={<button type="button" className="btn btn-primary" onClick={() => updateParams({ page: 1 })}>Go to page 1</button>}
      />
    );
  } else if (items.length === 0) {
    content = (
      <EmptyState
        icon={FaSearch}
        title="Sorry, no results found!"
        message={hasFilters
          ? 'Please check the spelling or try searching for something else.'
          : 'No products have been added yet.'}
        action={hasFilters ? <Link to="/products" className="btn btn-primary">Browse all products</Link> : null}
      />
    );
  } else {
    content = (
      <div className="product-grid">
        {sortedItems.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={addItem}
            inCart={isInCart(product._id)}
            adding={pendingId === product._id}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="page plp">
      <aside className="plp__filters card" aria-labelledby="plp-filters-title">
        <div className="plp__filters-head">
          <h2 id="plp-filters-title" className="plp__filters-title">Filters</h2>
          {hasFilters && (
            <button type="button" className="plp__clear" onClick={() => updateParams({ search: '', category: '', page: 1 })}>
              Clear all
            </button>
          )}
        </div>

        {hasFilters && (
          <div className="plp__chips">
            {search && (
              <button
                type="button"
                className="chip"
                onClick={() => updateParams({ search: '', page: 1 })}
                aria-label={`Remove search "${search}"`}
              >
                <FaTimes aria-hidden="true" /> <span>"{search}"</span>
              </button>
            )}
            {category && (
              <button
                type="button"
                className="chip"
                onClick={() => updateParams({ category: '', page: 1 })}
                aria-label={`Remove category ${categoryLabel}`}
              >
                <FaTimes aria-hidden="true" /> <span>{categoryLabel}</span>
              </button>
            )}
          </div>
        )}

        <fieldset className="plp__group">
          <legend className="plp__group-title">Categories</legend>
          <div className="plp__options">
            <label className="plp__option">
              <input
                type="radio"
                name="plp-category"
                checked={!category}
                onChange={() => updateParams({ category: '', page: 1 })}
              />
              <span>All categories</span>
            </label>
            {categoryOptions.map((option) => (
              <label key={option} className="plp__option">
                <input
                  type="radio"
                  name="plp-category"
                  checked={category === option}
                  onChange={() => updateParams({ category: option, page: 1 })}
                />
                <span>{getCategoryMeta(option).label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </aside>

      <section className="plp__results card" aria-labelledby="plp-title">
        <div className="plp__head">
          <Breadcrumbs items={crumbs} />
          <h1 id="plp-title" className="plp__title">{heading}</h1>
          {status === 'succeeded' && total > 0 && items.length > 0 && (
            <p className="plp__count">Showing {first} – {last} of {total} products</p>
          )}
          <div className="plp__sort" role="group" aria-label="Sort products">
            <span className="plp__sort-label" aria-hidden="true">Sort By</span>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`plp__sort-btn${sort === option.value ? ' is-active' : ''}`}
                aria-pressed={sort === option.value}
                onClick={() => updateParams({ sort: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {content}

        {status === 'succeeded' && (
          <Pagination page={page} pages={pages} onChange={(nextPage) => updateParams({ page: nextPage })} />
        )}
      </section>
    </div>
  )
}

export default Products
