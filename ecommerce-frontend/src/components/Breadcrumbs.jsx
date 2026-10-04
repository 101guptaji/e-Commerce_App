import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

// items: [{ label, to? }] - the last item is the current page.
const Breadcrumbs = ({ items, className = '' }) => (
  <nav aria-label="Breadcrumb" className={className}>
    <ol className="breadcrumbs">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={`${item.label}-${index}`} className="breadcrumbs__item">
            {isLast || !item.to ? (
              <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
            {!isLast && <FaChevronRight className="breadcrumbs__sep" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumbs;
