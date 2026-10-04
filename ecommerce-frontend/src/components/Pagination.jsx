import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import '../styles/paginationStyle.css'

// Page numbers with ellipses, e.g. [1, 'gap-start', 4, 5, 6, 'gap-end', 10]
const getPageItems = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  let start = Math.max(2, page - 1);
  let end = Math.min(pages - 1, page + 1);
  if (page <= 3) end = 4;
  if (page >= pages - 2) start = pages - 3;

  const items = [1];
  if (start > 2) items.push('gap-start');
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < pages - 1) items.push('gap-end');
  items.push(pages);
  return items;
};

const Pagination = ({ page, pages, onChange, className = '' }) => {
  if (!pages || pages <= 1) return null;

  const go = (target) => {
    if (target >= 1 && target <= pages && target !== page) onChange(target);
  };

  return (
    <nav className={`pgn ${className}`} aria-label="Pagination">
      <p className="pgn__summary">Page {page} of {pages}</p>
      <ul className="pgn__list">
        <li>
          <button
            type="button"
            className="pgn__nav"
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <FaChevronLeft aria-hidden="true" /> <span>Previous</span>
          </button>
        </li>
        {getPageItems(page, pages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={`pgn__page${item === page ? ' is-active' : ''}`}
                onClick={() => go(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="pgn__gap" aria-hidden="true">…</li>
          )
        )}
        <li>
          <button
            type="button"
            className="pgn__nav"
            onClick={() => go(page + 1)}
            disabled={page >= pages}
            aria-label="Next page"
          >
            <span>Next</span> <FaChevronRight aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
