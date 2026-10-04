import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';

const NotFound = () => (
  <div className="page">
    <EmptyState
      className="card"
      icon={FaSearch}
      title="Page not found"
      message="The page you are looking for doesn't exist or may have been moved."
      action={<Link to="/" className="btn btn-primary">Go to home</Link>}
    />
  </div>
);

export default NotFound;
