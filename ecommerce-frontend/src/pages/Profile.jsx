import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  FaBoxOpen,
  FaChevronRight,
  FaShoppingCart,
  FaSignOutAlt,
  FaTachometerAlt,
  FaThLarge,
  FaUser
} from 'react-icons/fa'
import { logout } from '../redux/slices/authSlice'
import { selectCartCount } from '../redux/slices/cartSlice'
import '../styles/profileStyle.css'

const getInitials = (value) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);

  const name = user?.name?.trim() || '';
  const email = user?.email || '';
  const isAdmin = role === 'admin';
  const initials = getInitials(name || email || '?');

  const handleLogout = () => {
    navigate('/');
    dispatch(logout());
    toast.success('You have been logged out');
  };

  return (
    <div className="page profile">
      <aside className="profile__side">
        <div className="profile__hello card">
          <span className="profile__avatar" aria-hidden="true">{initials}</span>
          <div className="profile__hello-text">
            <p className="profile__hello-label">Hello,</p>
            <p className="profile__hello-name">{name || email || 'Shopper'}</p>
          </div>
        </div>

        <nav className="profile__nav card" aria-label="Account">
          <Link to="/orders" className="profile__nav-item">
            <FaBoxOpen aria-hidden="true" className="profile__nav-icon" />
            <span>My Orders</span>
            <FaChevronRight aria-hidden="true" className="profile__nav-arrow" />
          </Link>
          <Link to="/cart" className="profile__nav-item">
            <FaShoppingCart aria-hidden="true" className="profile__nav-icon" />
            <span>My Cart</span>
            {cartCount > 0 && <span className="profile__count">{cartCount}</span>}
            <FaChevronRight aria-hidden="true" className="profile__nav-arrow" />
          </Link>
          {isAdmin && (
            <Link to="/admin" className="profile__nav-item">
              <FaTachometerAlt aria-hidden="true" className="profile__nav-icon" />
              <span>Admin Dashboard</span>
              <FaChevronRight aria-hidden="true" className="profile__nav-arrow" />
            </Link>
          )}
          <button type="button" className="profile__nav-item" onClick={handleLogout}>
            <FaSignOutAlt aria-hidden="true" className="profile__nav-icon" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <section className="profile__main card" aria-labelledby="profile-title">
        <h1 id="profile-title" className="profile__title">
          <FaUser aria-hidden="true" /> Personal Information
        </h1>

        <dl className="profile__info">
          <div className="profile__info-item">
            <dt>Full name</dt>
            <dd>{name || 'Not provided'}</dd>
          </div>
          <div className="profile__info-item">
            <dt>Email address</dt>
            <dd>{email || 'Not available'}</dd>
          </div>
          <div className="profile__info-item">
            <dt>Account type</dt>
            <dd>{isAdmin ? 'Administrator' : 'Customer'}</dd>
          </div>
        </dl>

        <h2 className="profile__subtitle">Quick links</h2>
        <div className="profile__quick">
          <Link to="/orders" className="profile__quick-link">
            <span className="profile__quick-icon" aria-hidden="true"><FaBoxOpen /></span>
            <span>
              <strong>Your orders</strong>
              <small>Track and review your orders</small>
            </span>
          </Link>
          <Link to="/cart" className="profile__quick-link">
            <span className="profile__quick-icon" aria-hidden="true"><FaShoppingCart /></span>
            <span>
              <strong>Your cart</strong>
              <small>{cartCount} {cartCount === 1 ? 'item' : 'items'} waiting for you</small>
            </span>
          </Link>
          <Link to="/products" className="profile__quick-link">
            <span className="profile__quick-icon" aria-hidden="true"><FaThLarge /></span>
            <span>
              <strong>Continue shopping</strong>
              <small>Browse all products</small>
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Profile
