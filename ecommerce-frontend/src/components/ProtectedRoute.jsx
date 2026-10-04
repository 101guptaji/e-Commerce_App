import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRedirectTarget } from '../utils/navigation';

const useReturnPath = () => {
  const location = useLocation();
  return `${location.pathname}${location.search}`;
};

// Signed-in users only; guests go to login and come back afterwards.
export const PrivateRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  const from = useReturnPath();
  if (!token) return <Navigate to="/login" replace state={{ from }} />;
  return children;
};

// Admins only.
export const AdminRoute = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const from = useReturnPath();
  if (!token) return <Navigate to="/login" replace state={{ from }} />;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Login/Register: signed-in users are sent on to where they were heading.
export const GuestRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();
  if (token) return <Navigate to={getRedirectTarget(location.state)} replace />;
  return children;
};
