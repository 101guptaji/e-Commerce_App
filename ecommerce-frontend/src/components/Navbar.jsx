import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/slices/authSlice'
import { FaShoppingCart } from 'react-icons/fa'
import '../styles/navbarStyle.css'

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, role } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo" style={{textDecoration: 'none'}}>HG Shop</Link>
      <div className="nav-links">
        {token && role === 'admin' && <Link to="/admin">Admin</Link>}
        {token ? (
          <>
            <Link to="/orders">Orders</Link>
            <Link to="/cart" className="cart-link">
              <FaShoppingCart />
              Cart
            </Link>
            {user?.name && <Link to="/profile">{user?.name}</Link>}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar