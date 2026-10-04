import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProductImage from './ProductImage';
import { Skeleton } from './Skeletons';
import { money } from '../utils/format';
import '../styles/productSectionStyle.css';

const LOW_STOCK_LIMIT = 5;

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Horizontally scrolling product row ("Best of Electronics" style) with arrow buttons.
const ProductSection = ({
  title,
  subtitle,
  products = [],
  loading = false,
  viewAllTo,
  viewAllLabel = 'View all',
}) => {
  const headingId = useId();
  const scrollerRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    updateArrows();
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateArrows, products.length, loading]);

  const scrollByPage = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.9,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  return (
    <section className="psec" aria-labelledby={headingId} aria-busy={loading}>
      <div className="psec__head">
        <div>
          <h2 id={headingId} className="psec__title">{title}</h2>
          {subtitle && <p className="psec__subtitle">{subtitle}</p>}
        </div>
        {viewAllTo && (
          <Link to={viewAllTo} className="btn btn-outline btn-sm psec__all" aria-describedby={headingId}>
            {viewAllLabel} <FaArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="psec__body">
        <ul ref={scrollerRef} className="psec__scroller no-scrollbar" onScroll={updateArrows}>
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <li key={index} className="psec__item" aria-hidden="true">
                  <div className="ptile">
                    <span className="skeleton ptile__media" />
                    <Skeleton width="80%" height={14} />
                    <Skeleton width="50%" height={14} />
                  </div>
                </li>
              ))
            : products.map((product) => {
                const stock = Number(product.stock) || 0;
                let note = 'Free delivery';
                if (stock <= 0) note = 'Out of stock';
                else if (stock <= LOW_STOCK_LIMIT) note = `Only ${stock} left`;

                return (
                  <li key={product._id} className="psec__item">
                    <Link to={`/products/${product._id}`} className="ptile">
                      <span className="ptile__media">
                        <ProductImage src={product.image} alt="" className="ptile__img" />
                      </span>
                      <span className="ptile__name">{product.name}</span>
                      <span className="ptile__price">{money(product.price)}</span>
                      <span className={`ptile__note${stock <= LOW_STOCK_LIMIT ? ' is-alert' : ''}`}>{note}</span>
                    </Link>
                  </li>
                );
              })}
        </ul>

        {/* Mouse convenience only: keyboard users tab through the tiles, which scrolls the row. */}
        {canScrollPrev && (
          <button
            type="button"
            className="psec__arrow psec__arrow--prev"
            onClick={() => scrollByPage(-1)}
            tabIndex={-1}
            aria-hidden="true"
          >
            <FaChevronLeft />
          </button>
        )}
        {canScrollNext && (
          <button
            type="button"
            className="psec__arrow psec__arrow--next"
            onClick={() => scrollByPage(1)}
            tabIndex={-1}
            aria-hidden="true"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
