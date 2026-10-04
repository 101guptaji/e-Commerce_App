import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../redux/slices/authSlice'
import { useRef, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
    FaCheckCircle,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaRegCircle,
    FaTimes,
    FaUserShield
} from 'react-icons/fa'
import '../styles/loginRegister.css'

// Mirrors the password policy enforced by the API.
const PASSWORD_RULES = [
    { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
    { id: 'upper', label: 'An uppercase letter', test: (value) => /[A-Z]/.test(value) },
    { id: 'lower', label: 'A lowercase letter', test: (value) => /[a-z]/.test(value) },
    { id: 'number', label: 'A number', test: (value) => /\d/.test(value) },
    { id: 'special', label: 'A special character (@$!%*?&)', test: (value) => /[@$!%*?&]/.test(value) },
];
const ALLOWED_PASSWORD_CHARS = /^[A-Za-z\d@$!%*?&]*$/;

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading } = useSelector((state) => state.auth);
    const passwordRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');

    const rules = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(formData.password) }));
    const hasInvalidChars = !ALLOWED_PASSWORD_CHARS.test(formData.password);
    const passwordValid = rules.every((rule) => rule.met) && !hasInvalidChars;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (formError) setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!passwordValid) {
            setFormError('Please choose a password that meets all the requirements.');
            passwordRef.current?.focus();
            return;
        }

        const email = formData.email.trim().toLowerCase();
        try {
            await dispatch(registerUser({
                name: formData.name.trim(),
                email,
                password: formData.password,
                role: 'customer'
            })).unwrap();
            toast.success('Account created! Please log in.');
            navigate('/login', { state: { ...location.state, email } });
        } catch (error) {
            setFormError(error?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className='page auth'>
            <div className="auth__card card">
                <aside className="auth__aside">
                    <h1 className="auth__title">Looks like you're new here!</h1>
                    <p className="auth__subtitle">Sign up with your email to get started</p>
                    <ul className="auth__perks">
                        <li><FaCheckCircle aria-hidden="true" /> Save items to your cart</li>
                        <li><FaCheckCircle aria-hidden="true" /> Place and track orders</li>
                    </ul>
                    <div className="auth__art" aria-hidden="true"><FaUserShield /></div>
                </aside>

                <div className="auth__main">
                    <form onSubmit={handleSubmit} className='auth__form'>
                        <div className="float-field">
                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                placeholder=" "
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="register-name">Full Name</label>
                        </div>

                        <div className="float-field">
                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                placeholder=" "
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="register-email">Email Address</label>
                        </div>

                        <div className="float-field float-field--password">
                            <input
                                ref={passwordRef}
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder=" "
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                aria-describedby="register-password-rules"
                                aria-invalid={formData.password.length > 0 && !passwordValid}
                                required
                            />
                            <label htmlFor="register-password">Set Password</label>
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

                        <ul id="register-password-rules" className="pw-rules" aria-label="Password requirements">
                            {rules.map((rule) => (
                                <li key={rule.id} className={rule.met ? 'is-met' : undefined}>
                                    {rule.met ? <FaCheckCircle aria-hidden="true" /> : <FaRegCircle aria-hidden="true" />}
                                    <span>{rule.label}</span>
                                    <span className="visually-hidden">{rule.met ? '(done)' : '(missing)'}</span>
                                </li>
                            ))}
                            {hasInvalidChars && (
                                <li className="is-error">
                                    <FaTimes aria-hidden="true" />
                                    <span>Use only letters, numbers and @$!%*?& (no spaces)</span>
                                </li>
                            )}
                        </ul>

                        {formError && (
                            <p className="auth__error" role="alert">
                                <FaExclamationTriangle aria-hidden="true" /> {formError}
                            </p>
                        )}

                        <button type="submit" className="btn btn-cta btn-block auth__submit" disabled={loading}>
                            {loading && <span className="spinner" aria-hidden="true" />}
                            {loading ? 'Creating account…' : 'Continue'}
                        </button>
                    </form>

                    <p className="auth__switch">
                        Existing user? <Link to="/login" state={location.state}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
