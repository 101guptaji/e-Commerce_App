import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaPause, FaPlay } from 'react-icons/fa';
import ProductImage from './ProductImage';
import '../styles/heroCarouselStyle.css';

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 40;

const prefersReducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * Home banner: auto-plays, pauses on hover/keyboard focus,
 * supports arrows, dots, swipe and an explicit pause button.
 * slides: [{ id, eyebrow, title, text, to, cta, image, icon, theme }]
 */
const HeroCarousel = ({ slides }) => {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(prefersReducedMotion);
  const touchStartX = useRef(null);

  const active = count ? index % count : 0;
  const autoplay = count > 1 && !userPaused && !hovered && !focused;

  useEffect(() => {
    if (!autoplay) return undefined;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [autoplay, active, count]);

  if (!count) return null;

  const goTo = (target) => setIndex(((target % count) + count) % count);
  const next = () => goTo(active + 1);
  const prev = () => goTo(active - 1);

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current == null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) next();
    else prev();
  };

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(event) => {
        if (event.target.matches?.(':focus-visible')) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero__viewport" aria-live={autoplay ? 'off' : 'polite'}>
        <div className="hero__track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {slides.map((slide, i) => {
            const Icon = slide.icon;
            return (
              <div
                key={slide.id}
                className={`hero__slide hero__slide--${slide.theme || 'crimson'}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                inert={i !== active}
              >
                <div className="hero__content">
                  {slide.eyebrow && <p className="hero__eyebrow">{slide.eyebrow}</p>}
                  <h2 className="hero__title">{slide.title}</h2>
                  {slide.text && <p className="hero__text">{slide.text}</p>}
                  <Link to={slide.to} className="hero__cta">
                    {slide.cta || 'Shop now'} <FaArrowRight aria-hidden="true" />
                  </Link>
                </div>
                <div className="hero__art" aria-hidden="true">
                  {slide.image ? (
                    <ProductImage
                      src={slide.image}
                      alt=""
                      className="hero__img"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    Icon && <Icon className="hero__icon" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {count > 1 && (
        <>
          <button type="button" className="hero__arrow hero__arrow--prev" onClick={prev} aria-label="Previous slide">
            <FaChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="hero__arrow hero__arrow--next" onClick={next} aria-label="Next slide">
            <FaChevronRight aria-hidden="true" />
          </button>

          <div className="hero__controls">
            <button
              type="button"
              className="hero__toggle"
              onClick={() => setUserPaused((paused) => !paused)}
              aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
            >
              {userPaused ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}
            </button>
            <div className="hero__dots">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`hero__dot${i === active ? ' is-active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Show slide ${i + 1}: ${slide.title}`}
                  aria-current={i === active ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default HeroCarousel;
