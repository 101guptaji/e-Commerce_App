// Centered illustration + message used for empty carts, no results, errors and 404s.
const EmptyState = ({ icon: Icon, title, message, action, className = '' }) => (
  <div className={`empty-state ${className}`}>
    {Icon && (
      <div className="empty-state__icon" aria-hidden="true">
        <Icon />
      </div>
    )}
    <h2 className="empty-state__title">{title}</h2>
    {message && <p className="empty-state__text">{message}</p>}
    {action}
  </div>
);

export default EmptyState;
