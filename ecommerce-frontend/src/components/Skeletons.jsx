// Shimmer placeholders shown while data loads.
export const Skeleton = ({ width = '100%', height = 14, radius, className = '', style }) => (
  <span
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: radius, ...style }}
    aria-hidden="true"
  />
);

export const ProductCardSkeleton = () => (
  <div className="pc pc--skeleton" aria-hidden="true">
    <div className="pc__media">
      <Skeleton width="70%" height="80%" />
    </div>
    <div className="pc__body">
      <Skeleton height={14} />
      <Skeleton width="60%" height={14} />
      <Skeleton width="40%" height={12} />
      <Skeleton width="35%" height={18} />
    </div>
    <div className="pc__actions">
      <Skeleton height={32} />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="product-grid" role="status">
    <span className="visually-hidden">Loading products…</span>
    {Array.from({ length: count }, (_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);
