import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FaBolt,
  FaBoxOpen,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaShoppingCart,
  FaTruck
} from 'react-icons/fa'
import { fetchProductById } from '../redux/slices/productSlice'
import useAddToCart from '../hooks/useAddToCart'
import ProductImage from '../components/ProductImage'
import ProductSection from '../components/ProductSection'
import Breadcrumbs from '../components/Breadcrumbs'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/Skeletons'
import { formatDate, money } from '../utils/format'
import { categoryLink, getCategoryMeta } from '../utils/categories'
import '../styles/productDetailsStyle.css'

const LOW_STOCK_LIMIT = 5;
const DESCRIPTION_PREVIEW = 320;

const ProductDetailsSkeleton = () => (
  <div className="page pdp">
    <div className="pdp__card card" role="status">
      <span className="visually-hidden">Loading product…</span>
      <div className="pdp__gallery">
        <span className="skeleton pdp__skeleton-image" aria-hidden="true" />
        <div className="pdp__actions">
          <Skeleton height={52} />
          <Skeleton height={52} />
        </div>
      </div>
      <div className="pdp__info">
        <Skeleton width="40%" height={12} />
        <Skeleton width="90%" height={24} style={{ marginTop: 14 }} />
        <Skeleton width="65%" height={24} style={{ marginTop: 8 }} />
        <Skeleton width="30%" height={32} style={{ marginTop: 20 }} />
        <Skeleton height={110} style={{ marginTop: 24 }} />
        <Skeleton height={160} style={{ marginTop: 16 }} />
      </div>
    </div>
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, currentId, currentStatus, currentError, catalog } = useSelector((state) => state.products);
  const { addItem, isInCart, pendingId } = useAddToCart();
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(null); // { x, y } in % while the pointer is over the image

  useEffect(() => {
    dispatch(fetchProductById(id));
    setExpanded(false);
    setZoom(null);
  }, [dispatch, id]);

  const product = current?._id === id ? current : null;

  if (!product && currentId === id && currentStatus === 'failed') {
    const notFound = currentError === 'Product not found' || currentError === 'Invalid id';
    return (
      <div className="page">
        <EmptyState
          className="card"
          icon={notFound ? FaSearch : FaExclamationTriangle}
          title={notFound ? 'Product not found' : 'Something went wrong'}
          message={notFound
            ? 'This product may have been removed, or the link is incorrect.'
            : 'We could not load this product. Please try again.'}
          action={notFound
            ? <Link to="/products" className="btn btn-primary">Continue shopping</Link>
            : <button type="button" className="btn btn-primary" onClick={() => dispatch(fetchProductById(id))}>Try again</button>}
        />
      </div>
    );
  }

  if (!product) return <ProductDetailsSkeleton />;

  const meta = getCategoryMeta(product.category);
  const stock = Number(product.stock) || 0;
  const outOfStock = stock <= 0;
  const lowStock = !outOfStock && stock <= LOW_STOCK_LIMIT;
  const inCart = isInCart(product._id);
  const adding = pendingId === product._id;
  const description = product.description?.trim() || '';
  const isLong = description.length > DESCRIPTION_PREVIEW;
  const shownDescription = isLong && !expanded
    ? `${description.slice(0, DESCRIPTION_PREVIEW).trimEnd()}…`
    : description;
  const similar = product.category
    ? catalog.filter((p) => p.category === product.category && p._id !== product._id).slice(0, 12)
    : [];

  const handleAddToCart = () => (inCart ? navigate('/cart') : addItem(product));
  const handleBuyNow = () => (inCart ? navigate('/cart') : addItem(product, { goToCart: true }));

  // Hover zoom: scale the image around the pointer position.
  const handleZoomMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  let stockPill = <span className="pill pill-success">In stock</span>;
  let stockMessage = (
    <p className="pdp__stock text-green"><FaCheckCircle aria-hidden="true" /> In stock</p>
  );
  if (outOfStock) {
    stockPill = <span className="pill pill-danger">Out of stock</span>;
    stockMessage = <p className="pdp__stock text-red">Sold out. This item is currently out of stock.</p>;
  } else if (lowStock) {
    stockPill = <span className="pill pill-warning">Low stock</span>;
    stockMessage = <p className="pdp__stock text-red">Hurry, only {stock} left!</p>;
  }

  const crumbs = [
    { label: 'Home', to: '/' },
    product.category
      ? { label: meta.label, to: categoryLink(product.category) }
      : { label: 'Products', to: '/products' },
    { label: product.name },
  ];

  return (
    <div className='page pdp'>
      <div className="pdp__card card">
        <div className="pdp__gallery">
          <div
            className={`pdp__image-box${zoom ? ' is-zooming' : ''}`}
            onMouseMove={product.image ? handleZoomMove : undefined}
            onMouseLeave={() => setZoom(null)}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              className="pdp__image"
              loading="eager"
              style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
            {outOfStock && <span className="pdp__flag">Sold out</span>}
          </div>
          {product.image && <p className="pdp__zoom-hint" aria-hidden="true">Hover over the image to zoom</p>}

          <div className="pdp__actions">
            <button
              type="button"
              className="btn btn-cart"
              onClick={handleAddToCart}
              disabled={adding || (outOfStock && !inCart)}
            >
              {adding ? <span className="spinner" aria-hidden="true" /> : <FaShoppingCart aria-hidden="true" />}
              {inCart ? 'Go to cart' : 'Add to cart'}
            </button>
            <button
              type="button"
              className="btn btn-cta"
              onClick={handleBuyNow}
              disabled={adding || outOfStock}
            >
              <FaBolt aria-hidden="true" /> Buy now
            </button>
          </div>
        </div>

        <div className="pdp__info">
          <Breadcrumbs items={crumbs} />
          <h1 className="pdp__title">{product.name}</h1>
          <div className="pdp__tags">
            <span className="pill pill-info">{meta.label}</span>
            {stockPill}
          </div>

          <div className="pdp__price-row">
            <span className="pdp__price">{money(product.price)}</span>
            <span className="pdp__delivery">Free delivery</span>
          </div>
          {stockMessage}

          <section className="pdp__panel" aria-labelledby="pdp-services-title">
            <h2 id="pdp-services-title" className="pdp__panel-title">Delivery &amp; services</h2>
            <ul className="pdp__services">
              <li><FaTruck aria-hidden="true" /> Free delivery on this item</li>
              <li>
                <FaBoxOpen aria-hidden="true" />
                <span>Track your order any time from <Link to="/orders">My Orders</Link></span>
              </li>
            </ul>
          </section>

          <section className="pdp__panel" aria-labelledby="pdp-specs-title">
            <h2 id="pdp-specs-title" className="pdp__panel-title">Specifications</h2>
            <table className="pdp__specs">
              <tbody>
                <tr>
                  <th scope="row">Category</th>
                  <td>{meta.label}</td>
                </tr>
                <tr>
                  <th scope="row">Availability</th>
                  <td>{outOfStock ? 'Out of stock' : `${stock} in stock`}</td>
                </tr>
                {product.createdAt && (
                  <tr>
                    <th scope="row">Listed on</th>
                    <td>{formatDate(product.createdAt)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="pdp__panel" aria-labelledby="pdp-desc-title">
            <h2 id="pdp-desc-title" className="pdp__panel-title">Description</h2>
            <div className="pdp__panel-body">
              <p className="pdp__desc">{shownDescription || 'No description available for this product.'}</p>
              {isLong && (
                <button
                  type="button"
                  className="pdp__more"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                >
                  {expanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {similar.length > 0 && (
        <ProductSection
          title="Similar products"
          subtitle={`More from ${meta.label}`}
          products={similar}
          viewAllTo={categoryLink(product.category)}
        />
      )}
    </div>
  )
}

export default ProductDetails
