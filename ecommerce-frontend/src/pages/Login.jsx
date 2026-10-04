import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../redux/slices/authSlice'
import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaBoxOpen, FaExclamationTriangle, FaEye, FaEyeSlash, FaShoppingBag, FaTruck } from 'react-icons/fa'
import { getRedirectTarget } from '../utils/navigation'
import '../styles/loginRegister.css'

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await dispatch(loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })).unwrap();
      toast.success('Welcome back!');
      navigate(getRedirectTarget(location.state), { replace: true });
    } catch (error) {
      setFormError(error?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className='page auth'>
      <div className="auth__card card">
        <aside className="auth__aside">
          <h1 className="auth__title">Login</h1>
          <p className="auth__subtitle">Get access to your Orders, Cart and a faster checkout</p>
          <ul className="auth__perks">
            <li><FaTruck aria-hidden="true" /> Free delivery on every order</li>
            <li><FaBoxOpen aria-hidden="true" /> Track all your orders in one place</li>
          </ul>
          <div className="auth__art" aria-hidden="true"><FaShoppingBag /></div>
        </aside>

        <div className="auth__main">
          <form onSubmit={handleSubmit} className='auth__form'>
            <div className="float-field">
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder=" "
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="login-email">Enter Email</label>
            </div>

            <div className="float-field float-field--password">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder=" "
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="login-password">Enter Password</label>
              <button
                type="button"
                className="float-field__toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Show password"
                aria-pressed={showPassword}
              >
                {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
              </button>
            </div>

            {formError && (
              <p className="auth__error" role="alert">
                <FaExclamationTriangle aria-hidden="true" /> {formError}
              </p>
            )}

            <button type="submit" className="btn btn-cta btn-block auth__submit" disabled={loading}>
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="auth__switch">
            New to HG Shop? <Link to="/register" state={location.state}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
