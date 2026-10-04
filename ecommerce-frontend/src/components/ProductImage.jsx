import { useState } from 'react';
import { FaImage } from 'react-icons/fa';

// <img> with lazy loading and a neutral placeholder when the URL is missing or broken.
const ProductImage = ({ src, alt = '', className = '', loading = 'lazy', ...rest }) => {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <span
        className={`img-fallback ${className}`}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : 'true'}
      >
        <FaImage aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src)}
      {...rest}
    />
  );
};

export default ProductImage;
