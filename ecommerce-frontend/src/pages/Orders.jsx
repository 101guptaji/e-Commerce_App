import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaBoxOpen, FaCheck, FaExclamationTriangle, FaSearch } from "react-icons/fa";
import { fetchOrders } from "../redux/slices/orderSlice";
import ProductImage from "../components/ProductImage";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeletons";
import { formatDate, money } from "../utils/format";
import '../styles/ordersStyle.css'

// Order statuses supported by the API, in delivery order.
const STATUS_META = {
  created: { label: 'Order placed', tone: 'info', step: 0 },
  shipped: { label: 'Shipped', tone: 'warning', step: 1 },
  delivered: { label: 'Delivered', tone: 'success', step: 2 },
};
const TRACK_STEPS = ['Ordered', 'Shipped', 'Delivered'];

const normalizeStatus = (status) => (STATUS_META[status] ? status : 'created');
const shortId = (id = '') => String(id).slice(-8).toUpperCase();

const OrdersSkeleton = () => (
  <div className="orders__list" role="status">
    <span className="visually-hidden">Loading your orders…</span>
    {[0, 1, 2].map((key) => (
      <div key={key} className="ocard card" aria-hidden="true">
        <div className="ocard__head">
          <Skeleton width="55%" height={16} />
        </div>
        <div className="oitem">
          <span className="skeleton oitem__media" />
          <div className="oitem__info">
            <Skeleton width="70%" height={14} />
            <Skeleton width="35%" height={12} style={{ marginTop: 8 }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const OrderCard = ({ order, isAdmin }) => {
  const meta = STATUS_META[normalizeStatus(order.status)];
  const items = order.items || [];
  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <li className="ocard card">
      <div className="ocard__head">
        <dl className="ocard__facts">
          <div>
            <dt>Order ID</dt>
            <dd title={order._id}>#{shortId(order._id)}</dd>
          </div>
          <div>
            <dt>Placed on</dt>
            <dd>{formatDate(order.createdAt) || '—'}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{money(order.totalAmount)}</dd>
          </div>
          {isAdmin && order.user?.email && (
            <div>
              <dt>Customer</dt>
              <dd>{order.user.email}</dd>
            </div>
          )}
        </dl>
        <span className={`pill pill-${meta.tone}`}>
          <span className="pill__dot" aria-hidden="true" /> {meta.label}
        </span>
      </div>

      <ul className="ocard__items">
        {items.map((item) => {
          // Products are populated by the API; deleted products come back as null.
          const product = item.product && typeof item.product === 'object' ? item.product : null;
          const unitPrice = Number(item.priceAtPurchase ?? product?.price) || 0;
          return (
            <li key={item._id} className="oitem">
              <span className="oitem__media">
                <ProductImage src={product?.image} alt="" className="oitem__img" />
              </span>
              <div className="oitem__info">
                {product ? (
                  <Link to={`/products/${product._id}`} className="oitem__name">{product.name}</Link>
                ) : (
                  <span className="oitem__name is-muted">Product no longer available</span>
                )}
                <p className="oitem__meta">Qty: {item.quantity} · {money(unitPrice)} each</p>
              </div>
              <p className="oitem__price">{money(unitPrice * item.quantity)}</p>
            </li>
          );
        })}
      </ul>

      <div className="ocard__foot">
        <ol className="otrack" aria-label={`Order status: ${meta.label}`}>
          {TRACK_STEPS.map((label, index) => (
            <li
              key={label}
              className={`otrack__step${index <= meta.step ? ' is-done' : ''}`}
              aria-current={index === meta.step ? 'step' : undefined}
            >
              <span className="otrack__dot" aria-hidden="true">{index <= meta.step && <FaCheck />}</span>
              <span className="otrack__label">{label}</span>
            </li>
          ))}
        </ol>
        <p className="ocard__count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
      </div>
    </li>
  );
};

export const Orders = () => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.order);
  const isAdmin = useSelector((state) => state.auth.role === 'admin');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // All orders are loaded at once, so search and status filters run locally.
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter.length && !statusFilter.includes(normalizeStatus(order.status))) return false;
      if (!term) return true;
      return String(order._id).toLowerCase().includes(term)
        || (isAdmin && order.user?.email?.toLowerCase().includes(term))
        || (order.items || []).some((item) => item?.product?.name?.toLowerCase().includes(term));
    });
  }, [orders, query, statusFilter, isAdmin]);

  const toggleStatus = (value) => {
    setStatusFilter((current) => (
      current.includes(value) ? current.filter((s) => s !== value) : [...current, value]
    ));
  };

  const clearFilters = () => {
    setQuery('');
    setStatusFilter([]);
  };

  const hasFilters = Boolean(query.trim()) || statusFilter.length > 0;
  const showSkeleton = status === 'idle' || (status === 'loading' && orders.length === 0);

  let content;
  if (showSkeleton) {
    content = <OrdersSkeleton />;
  } else if (status === 'failed' && orders.length === 0) {
    content = (
      <EmptyState
        className="card"
        icon={FaExclamationTriangle}
        title="We couldn't load your orders"
        message={error || 'Please try again in a moment.'}
        action={<button type="button" className="btn btn-primary" onClick={() => dispatch(fetchOrders())}>Try again</button>}
      />
    );
  } else if (orders.length === 0) {
    content = (
      <EmptyState
        className="card"
        icon={FaBoxOpen}
        title="You haven't placed any orders yet"
        message="Once you place an order, you can track it here."
        action={<Link to="/products" className="btn btn-primary">Start shopping</Link>}
      />
    );
  } else if (filtered.length === 0) {
    content = (
      <EmptyState
        className="card"
        icon={FaSearch}
        title="No orders match your filters"
        message="Try a different search term or clear the filters."
        action={<button type="button" className="btn btn-primary" onClick={clearFilters}>Clear filters</button>}
      />
    );
  } else {
    content = (
      <ul className="orders__list">
        {filtered.map((order) => <OrderCard key={order._id} order={order} isAdmin={isAdmin} />)}
      </ul>
    );
  }

  return (
    <div className="page orders">
      <aside className="orders__filters card" aria-labelledby="orders-filters-title">
        <div className="orders__filters-head">
          <h2 id="orders-filters-title" className="orders__filters-title">Filters</h2>
          {hasFilters && (
            <button type="button" className="orders__clear" onClick={clearFilters}>Clear all</button>
          )}
        </div>
        <fieldset className="orders__group">
          <legend className="orders__group-title">Order status</legend>
          <div className="orders__options">
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <label key={value} className="orders__option">
                <input
                  type="checkbox"
                  checked={statusFilter.includes(value)}
                  onChange={() => toggleStatus(value)}
                />
                <span>{meta.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </aside>

      <section className="orders__main" aria-labelledby="orders-title">
        <div className="orders__top">
          <div>
            <h1 id="orders-title" className="orders__title">{isAdmin ? 'All Orders' : 'My Orders'}</h1>
            {status === 'succeeded' && orders.length > 0 && (
              <p className="orders__summary">
                Showing {filtered.length} of {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
            )}
          </div>
          <div className="orders__search">
            <label htmlFor="orders-search" className="visually-hidden">Search orders</label>
            <input
              id="orders-search"
              type="search"
              placeholder={isAdmin ? 'Search by product, order ID or customer' : 'Search your orders here'}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="orders__search-icon" aria-hidden="true"><FaSearch /></span>
          </div>
        </div>

        {content}
      </section>
    </div>
  )
}
