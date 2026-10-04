import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import {
  FaBars,
  FaBoxOpen,
  FaChevronDown,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaTachometerAlt,
  FaThLarge,
  FaTimes,
  FaUser,
  FaUserCircle
} from 'react-icons/fa'
import { logout } from '../redux/slices/authSlice'
import { selectCartCount } from '../redux/slices/cartSlice'
import { categoryLink, getCategoryMeta } from '../utils/categories'
import SearchBar from './SearchBar'
import '../styles/navbarStyle.css'

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, role } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const categories = useSelector((state) => state.products.categories);

  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);
  const hoverOpenedRef = useRef(false);
  const drawerRef = useRef(null);

  const isAdmin = Boolean(token) && role === 'admin';
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Account';
  const firstName = displayName.split(/\s+/)[0];
  const returnPath = `${location.pathname}${location.search}`;

  // Close menus whenever the route changes.
  useEffect(() => {
    hoverOpenedRef.current = false;
    setMenuOpen(false);
    setDrawerOpen(false);
  }, [location.pathname, location.search]);

  // Account dropdown: close on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        hoverOpenedRef.current = false;
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        hoverOpenedRef.current = false;
        setMenuOpen(false);
        menuRef.current?.querySelector('button')?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  // The mobile drawer is a native modal <dialog>: focus trap, Escape and backdrop for free.
  useEffect(() => {
    const dialog = drawerRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    if (!drawerOpen && dialog.open) dialog.close();
  }, [drawerOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    setDrawerOpen(false);
    navigate('/');
    dispatch(logout());
    toast.success('You have been logged out');
  };

  // Desktop dropdown opens on hover and on click/keyboard.
  const onAccountEnter = () => {
    if (!menuOpen) {
      hoverOpenedRef.current = true;
      setMenuOpen(true);
    }
  };

  const onAccountLeave = () => {
    if (hoverOpenedRef.current) {
      hoverOpenedRef.current = false;
      setMenuOpen(false);
    }
  };

  const onAccountClick = () => {
    if (hoverOpenedRef.current) {
      // Already opened by hover: a click pins it open instead of closing it.
      hoverOpenedRef.current = false;
      return;
    }
    setMenuOpen((open) => !open);
  };

  const closeMenuOnSelect = (event) => {
    if (event.target.closest('a, button')) {
      hoverOpenedRef.current = false;
      setMenuOpen(false);
    }
  };

  const onDrawerClick = (event) => {
    // Backdrop clicks land on the <dialog> itself; link clicks should close it too.
    if (event.target === event.currentTarget || event.target.closest('a')) setDrawerOpen(false);
  };

  return (
    <header className="hdr">
      <div className="hdr__inner">
        <button
          type="button"
          className="hdr__menu-btn"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <FaBars aria-hidden="true" />
        </button>

        <Link to="/" className="hdr__logo" aria-label="HG Shop home">
          <span className="hdr__logo-mark" aria-hidden="true">HG</span>
          <span className="hdr__logo-text" aria-hidden="true">
            Shop<span className="hdr__logo-dot">.</span>
          </span>
        </Link>

        <SearchBar className="hdr__search" />

        <nav className="hdr__actions" aria-label="Account and cart">
          {token ? (
            <div
              className="hdr__account"
              ref={menuRef}
              onMouseEnter={onAccountEnter}
              onMouseLeave={onAccountLeave}
            >
              <button
                type="button"
                className="hdr__account-btn"
                aria-expanded={menuOpen}
                aria-controls="account-menu"
                onClick={onAccountClick}
              >
                <FaUserCircle aria-hidden="true" className="hdr__account-icon" />
                <span className="hdr__account-name">{firstName}</span>
                <FaChevronDown aria-hidden="true" className={`hdr__chevron${menuOpen ? ' is-open' : ''}`} />
              </button>

              {menuOpen && (
                <div className="hdr__dropdown" id="account-menu" onClick={closeMenuOnSelect}>
                  <div className="hdr__dropdown-card">
                    <p className="hdr__dropdown-head">Hello, {displayName}</p>
                    <ul>
                      <li><Link to="/profile"><FaUser aria-hidden="true" /> My Profile</Link></li>
                      <li><Link to="/orders"><FaBoxOpen aria-hidden="true" /> Orders</Link></li>
                      <li><Link to="/cart"><FaShoppingCart aria-hidden="true" /> My Cart</Link></li>
                      {isAdmin && (
                        <li><Link to="/admin"><FaTachometerAlt aria-hidden="true" /> Admin Dashboard</Link></li>
                      )}
                      <li>
                        <button type="button" onClick={handleLogout}>
                          <FaSignOutAlt aria-hidden="true" /> Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" state={{ from: returnPath }} className="hdr__login-btn">Login</Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="hdr__link hdr__link--desktop">
              <FaTachometerAlt aria-hidden="true" /> Dashboard
            </Link>
          )}

          <Link
            to="/cart"
            className="hdr__cart"
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          >
            <span className="hdr__cart-icon">
              <FaShoppingCart aria-hidden="true" />
              {cartCount > 0 && (
                <span key={cartCount} className="hdr__badge" aria-hidden="true">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </span>
            <span className="hdr__cart-label" aria-hidden="true">Cart</span>
          </Link>
        </nav>
      </div>

      <dialog
        ref={drawerRef}
        className="drawer"
        aria-label="Main menu"
        onClose={() => setDrawerOpen(false)}
        onClick={onDrawerClick}
      >
        <div className="drawer__panel">
          <div className="drawer__head">
            <FaUserCircle className="drawer__avatar" aria-hidden="true" />
            {token ? (
              <span className="drawer__hello">Hello, {firstName}</span>
            ) : (
              <Link to="/login" state={{ from: returnPath }} className="drawer__login">Login &amp; Signup</Link>
            )}
            <button
              type="button"
              className="drawer__close"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile">
            <ul className="drawer__list">
              <li><NavLink to="/" end><FaHome aria-hidden="true" /> Home</NavLink></li>
              <li><NavLink to="/products" end><FaThLarge aria-hidden="true" /> All Products</NavLink></li>
            </ul>

            {categories.length > 0 && (
              <>
                <p className="drawer__label">Shop by category</p>
                <ul className="drawer__list">
                  {categories.map((category) => {
                    const { label, icon: Icon } = getCategoryMeta(category);
                    return (
                      <li key={category}>
                        <Link to={categoryLink(category)}><Icon aria-hidden="true" /> {label}</Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <p className="drawer__label">My account</p>
            <ul className="drawer__list">
              <li><NavLink to="/orders"><FaBoxOpen aria-hidden="true" /> My Orders</NavLink></li>
              <li>
                <NavLink to="/cart">
                  <FaShoppingCart aria-hidden="true" /> My Cart
                  {cartCount > 0 && <span className="drawer__count">{cartCount}</span>}
                </NavLink>
              </li>
              <li><NavLink to="/profile"><FaUser aria-hidden="true" /> My Profile</NavLink></li>
              {isAdmin && (
                <li><NavLink to="/admin"><FaTachometerAlt aria-hidden="true" /> Admin Dashboard</NavLink></li>
              )}
              {token ? (
                <li>
                  <button type="button" onClick={handleLogout}>
                    <FaSignOutAlt aria-hidden="true" /> Logout
                  </button>
                </li>
              ) : (
                <li><Link to="/register"><FaUserCircle aria-hidden="true" /> Create an account</Link></li>
              )}
            </ul>
          </nav>
        </div>
      </dialog>
    </header>
  )
}

export default Navbar
