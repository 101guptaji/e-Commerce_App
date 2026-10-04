import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import API from '../api/axios';
import useDebounce from '../hooks/useDebounce';
import { escapeRegex } from '../utils/search';
import { money } from '../utils/format';
import { getCategoryMeta } from '../utils/categories';
import ProductImage from './ProductImage';

const MIN_QUERY_LENGTH = 2;
const SUGGESTION_LIMIT = 6;

// Header search with live product suggestions (ARIA combobox pattern).
const SearchBar = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const blurTimer = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const trimmed = query.trim();
  const debouncedQuery = useDebounce(trimmed, 250);

  // Mirror the search term from the URL on the listing page and clear it on home.
  useEffect(() => {
    if (location.pathname === '/products') {
      setQuery(new URLSearchParams(location.search).get('search') || '');
    } else if (location.pathname === '/') {
      setQuery('');
    }
    setOpen(false);
    setActiveIndex(-1);
  }, [location.pathname, location.search]);

  // Live suggestions for the debounced term; stale requests are cancelled.
  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus('idle');
      return undefined;
    }

    const controller = new AbortController();
    setStatus('loading');
    API.get('/products', {
      params: { page: 1, limit: SUGGESTION_LIMIT, search: escapeRegex(debouncedQuery) },
      signal: controller.signal,
    })
      .then((res) => {
        setResults(res.data?.products || []);
        setStatus('done');
        setActiveIndex(-1);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setResults([]);
        setStatus('error');
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const showPanel = open && trimmed.length >= MIN_QUERY_LENGTH;
  const isPending = status === 'loading' || trimmed !== debouncedQuery;

  const closePanel = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const goToProduct = (product) => {
    closePanel();
    inputRef.current?.blur();
    navigate(`/products/${product._id}`);
  };

  const submitSearch = () => {
    closePanel();
    inputRef.current?.blur();
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (showPanel && activeIndex >= 0 && results[activeIndex]) {
      goToProduct(results[activeIndex]);
    } else {
      submitSearch();
    }
  };

  const handleKeyDown = (event) => {
    const { key } = event;
    if (key === 'Escape') {
      if (showPanel) {
        event.preventDefault();
        closePanel();
      }
      return;
    }
    if ((key !== 'ArrowDown' && key !== 'ArrowUp') || results.length === 0) return;

    event.preventDefault();
    if (!showPanel) {
      setOpen(true);
      return;
    }
    setActiveIndex((index) => {
      if (key === 'ArrowDown') return index >= results.length - 1 ? 0 : index + 1;
      return index <= 0 ? results.length - 1 : index - 1;
    });
  };

  const handleFocus = () => {
    clearTimeout(blurTimer.current);
    setOpen(true);
  };

  const handleBlur = (event) => {
    if (formRef.current?.contains(event.relatedTarget)) return;
    // Defer so a tap on a suggestion can register before the panel closes.
    blurTimer.current = setTimeout(closePanel, 150);
  };

  let statusMessage = `No products match "${trimmed}"`;
  if (isPending) statusMessage = 'Searching…';
  else if (status === 'error') statusMessage = "Couldn't load suggestions. Press Enter to search.";

  return (
    <form
      ref={formRef}
      className={`search ${className}`}
      role="search"
      onSubmit={handleSubmit}
      onBlur={handleBlur}
    >
      <label htmlFor={inputId} className="visually-hidden">Search for products</label>
      <input
        ref={inputRef}
        id={inputId}
        className="search__input"
        type="search"
        placeholder="Search for products, brands and more"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPanel && results.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={showPanel && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        autoComplete="off"
        enterKeyHint="search"
      />
      <button type="submit" className="search__btn" aria-label="Search">
        <FaSearch aria-hidden="true" />
      </button>

      {showPanel && (
        <div className="search__panel">
          {results.length > 0 ? (
            <ul id={listboxId} role="listbox" aria-label="Suggested products" className="search__list">
              {results.map((product, index) => (
                <li
                  key={product._id}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`search__option${index === activeIndex ? ' is-active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goToProduct(product)}
                >
                  <ProductImage src={product.image} alt="" className="search__thumb" />
                  <span className="search__option-text">
                    <span className="search__option-name">{product.name}</span>
                    <span className="search__option-meta">
                      {getCategoryMeta(product.category).label} · {money(product.price)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="search__status" role="status">{statusMessage}</p>
          )}
          <button
            type="button"
            className="search__all"
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActiveIndex(-1)}
            onClick={submitSearch}
          >
            <FaSearch aria-hidden="true" />
            <span>See all results for "{trimmed}"</span>
          </button>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
