import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { FaExclamationTriangle, FaMinus, FaPlus, FaShoppingCart, FaTrashAlt, FaTruck } from 'react-icons/fa'
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../redux/slices/cartSlice'
import { placeOrder } from '../redux/slices/orderSlice'
import ProductImage from '../components/ProductImage'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { Skeleton } from '../components/Skeletons'
import { money } from '../utils/format'
import { getCategoryMeta } from '../utils/categories'
import '../styles/cartStyle.css'

const LOW_STOCK_LIMIT = 5;

const CartSkeleton = () => (
  <div className="page cart" role="status">
    <span className="visually-hidden">Loading your cart…</span>
    <div className="cart__main card" aria-hidden="true">
      <div className="cart__head"><Skeleton width={160} height={20} /></div>
      {[0, 1].map((key) => (
        <div key={key} className="citem">
          <span className="skeleton citem__media" />
          <div className="citem__info">
            <Skeleton width="80%" height={16} />
            <Skeleton width="40%" height={12} style={{ marginTop: 10 }} />
            <Skeleton width="25%" height={20} style={{ marginTop: 12 }} />
          </div>
        </div>
      ))}
    </div>
    <div className="cart__summary card" aria-hidden="true">
      <div className="cart__rows">
        <Skeleton height={16} />
        <Skeleton height={16} style={{ marginTop: 16 }} />
        <Skeleton height={20} style={{ marginTop: 24 }} />
      </div>
    </div>
  </div>
);

const CartLine = ({ item, busy, onChangeQuantity, onRemove }) => {
  const { product } = item;
  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;

  let note = <p className="citem__note text-green">In stock · Free delivery</p>;
  if (stock <= 0) {
    note = <p className="citem__note text-red">Out of stock. Remove it to place your order.</p>;
  } else if (item.quantity > stock) {
    note = <p className="citem__note text-red">Only {stock} left. Reduce the quantity to continue.</p>;
  } else if (stock <= LOW_STOCK_LIMIT) {
    note = <p className="citem__note text-red">Only {stock} left</p>;
  }

  return (
    <li className="citem">
      <Link to={`/products/${product._id}`} className="citem__media" tabIndex={-1} aria-hidden="true">
        <ProductImage src={product.image} alt="" className="citem__img" />
      </Link>

      <div className="citem__info">
        <Link to={`/products/${product._id}`} className="citem__name">{product.name}</Link>
        <p className="citem__category">{getCategoryMeta(product.category).label}</p>
        <p className="citem__price">
          {money(price * item.quantity)}
          {item.quantity > 1 && <span className="citem__each">({money(price)} each)</span>}
        </p>
        {note}
      </div>

      <div className="citem__qty">
        <div className="qty" role="group" aria-label={`Quantity for ${product.name}`}>
          <button
            type="button"
            className="qty__btn"
            onClick={() => onChangeQuantity(item, item.quantity - 1)}
            disabled={busy || item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <FaMinus aria-hidden="true" />
          </button>
          <span className="qty__value" aria-live="polite">
            {busy ? <span className="spinner" aria-hidden="true" /> : item.quantity}
          </span>
          <button
            type="button"
            className="qty__btn"
            onClick={() => onChangeQuantity(item, item.quantity + 1)}
            disabled={busy || item.quantity >= stock}
            aria-label="Increase quantity"
          >
            <FaPlus aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="citem__actions">
        <button type="button" className="citem__remove" onClick={() => onRemove(item)} disabled={busy}>
          Remove
        </button>
      </div>
    </li>
  );
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [], status, error } = useSelector((state) => state.cart);
  const placing = useSelector((state) => state.order.placing);
  const [busyItemId, setBusyItemId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'remove', item } | { type: 'clear' }
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(()=>{
    dispatch(fetchCart());
  }, [dispatch]);

  const available = items.filter((item) => item?.product);
  const unavailable = items.filter((item) => !item?.product);
  const itemCount = available.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = available.reduce((sum, item) => sum + (Number(item.product.price) || 0) * item.quantity, 0);
  const hasStockIssue = available.some((item) => item.quantity > (Number(item.product.stock) || 0));
  const canPlaceOrder = available.length > 0 && unavailable.length === 0 && !hasStockIssue;

  let blockedReason = '';
  if (unavailable.length > 0) blockedReason = 'Some items are no longer available. Remove them to place your order.';
  else if (hasStockIssue) blockedReason = 'Some items exceed the available stock. Update them to place your order.';

  const handleUpdateCartItem = async (item, quantity) => {
    if (quantity < 1) return;
    setBusyItemId(item._id);
    try {
      await dispatch(updateCartItem({ itemId: item._id, quantity })).unwrap();
      toast.success(`Quantity updated to ${quantity}`);
    }
    catch (error) {
      toast.error(error?.message || 'Failed to update cart item');
    }
    finally {
      setBusyItemId(null);
    }
  }

  const closeConfirm = () => {
    if (!confirmBusy) setConfirm(null);
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      if (confirm.type === 'remove') {
        await dispatch(removeFromCart(confirm.item._id)).unwrap();
        toast.success('Item removed from your cart');
      } else {
        await dispatch(clearCart()).unwrap();
        toast.success('Your cart has been cleared');
      }
      setConfirm(null);
    }
    catch (error) {
      toast.error(error?.message || 'Something went wrong. Please try again.');
    }
    finally {
      setConfirmBusy(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await dispatch(placeOrder()).unwrap();
      toast.success('Order placed successfully');
      navigate('/orders');
    }
    catch (error) {
      toast.error(error?.message || 'Failed to place order');
      dispatch(fetchCart()); // stock or availability may have changed
    }
  };

  const scrollToSummary = () => {
    document.getElementById('price-details')?.scrollIntoView({ block: 'start' });
  };

  if (status === 'idle' || (status === 'loading' && items.length === 0)) {
    return <CartSkeleton />;
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <div className="page">
        <EmptyState
          className="card"
          icon={FaExclamationTriangle}
          title="We couldn't load your cart"
          message={error || 'Please try again in a moment.'}
          action={<button type="button" className="btn btn-primary" onClick={() => dispatch(fetchCart())}>Try again</button>}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <EmptyState
          className="card"
          icon={FaShoppingCart}
          title="Your cart is empty!"
          message="Add items to it now."
          action={<Link to="/products" className="btn btn-primary">Shop now</Link>}
        />
      </div>
    );
  }

  const confirmCopy = confirm?.type === 'clear'
    ? { title: 'Clear cart', message: 'Are you sure you want to remove all items from your cart?', label: 'Clear cart' }
    : { title: 'Remove item', message: `Are you sure you want to remove ${confirm?.item?.product?.name || 'this item'} from your cart?`, label: 'Remove' };

  return (
    <div className='page cart'>
      <section className="cart__main card" aria-labelledby="cart-title">
        <div className="cart__head">
          <h1 id="cart-title" className="cart__title">
            My Cart <span>({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          </h1>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm({ type: 'clear' })}>
            <FaTrashAlt aria-hidden="true" /> Clear cart
          </button>
        </div>

        {blockedReason && (
          <p id="cart-blocked" className="cart__alert">
            <FaExclamationTriangle aria-hidden="true" /> {blockedReason}
          </p>
        )}

        <ul className="cart__list">
          {items.map((item) => (item?.product ? (
            <CartLine
              key={item._id}
              item={item}
              busy={busyItemId === item._id}
              onChangeQuantity={handleUpdateCartItem}
              onRemove={(line) => setConfirm({ type: 'remove', item: line })}
            />
          ) : (
            <li key={item._id} className="citem citem--unavailable">
              <span className="citem__media" aria-hidden="true">
                <ProductImage src={null} alt="" className="citem__img" />
              </span>
              <div className="citem__info">
                <p className="citem__name">This product is no longer available</p>
                <p className="citem__note text-red">It was removed from the store. Remove it to continue.</p>
              </div>
              <div className="citem__actions">
                <button type="button" className="citem__remove" onClick={() => setConfirm({ type: 'remove', item })}>
                  Remove
                </button>
              </div>
            </li>
          )))}
        </ul>

        <div className="cart__footer">
          <div className="cart__footer-total">
            <span className="cart__footer-amount">{money(totalAmount)}</span>
            <button type="button" className="cart__footer-link" onClick={scrollToSummary}>View price details</button>
          </div>
          <button
            type="button"
            className="btn btn-cta cart__place"
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder || placing}
            aria-describedby={blockedReason ? 'cart-blocked' : undefined}
          >
            {placing && <span className="spinner" aria-hidden="true" />}
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </section>

      <aside id="price-details" className="cart__summary card" aria-labelledby="price-details-title">
        <h2 id="price-details-title" className="cart__summary-title">Price details</h2>
        <dl className="cart__rows">
          <div className="cart__row">
            <dt>Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})</dt>
            <dd>{money(totalAmount)}</dd>
          </div>
          <div className="cart__row">
            <dt>Delivery charges</dt>
            <dd className="text-green">Free</dd>
          </div>
          <div className="cart__row cart__row--total">
            <dt>Total amount</dt>
            <dd>{money(totalAmount)}</dd>
          </div>
        </dl>
        <p className="cart__perk"><FaTruck aria-hidden="true" /> Free delivery on this order</p>
      </aside>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.label}
        busy={confirmBusy}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  )
}

export default Cart
