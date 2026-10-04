import { useId } from 'react'
import { Link } from "react-router-dom"
import { FaArrowRight, FaShoppingCart } from 'react-icons/fa'
import { money } from '../utils/format';
import { getCategoryMeta } from '../utils/categories';
import ProductImage from './ProductImage';
import '../styles/productCardStyle.css'

const LOW_STOCK_LIMIT = 5;

// Grid card for the listing page. The product name is a stretched link that makes
// the whole card clickable; the cart button sits above that link layer.
const ProductCard = ({ product, onAddToCart, inCart = false, adding = false }) => {
  const nameId = useId();
  const stock = Number(product.stock) || 0;
  const outOfStock = stock <= 0;
  const lowStock = !outOfStock && stock <= LOW_STOCK_LIMIT;

  let note = <p className="pc__note">Free delivery</p>;
  if (outOfStock) note = <p className="pc__note is-alert">Currently unavailable</p>;
  else if (lowStock) note = <p className="pc__note is-alert">Only {stock} left</p>;

  return (
    <article className={`pc${outOfStock ? ' pc--oos' : ''}`}>
      <div className="pc__media">
        <ProductImage src={product.image} alt="" className="pc__img" />
        {outOfStock && <span className="pc__flag">Out of stock</span>}
      </div>

      <div className="pc__body">
        <h3 className="pc__name" id={nameId}>
          <Link to={`/products/${product._id}`} className="pc__link">{product.name}</Link>
        </h3>
        <p className="pc__category">{getCategoryMeta(product.category).label}</p>
        <p className="pc__price">{money(product.price)}</p>
        {note}
      </div>

      <div className="pc__actions">
        {inCart ? (
          <Link to="/cart" className="btn btn-outline btn-sm btn-block" aria-describedby={nameId}>
            Go to cart <FaArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-dark btn-sm btn-block"
            onClick={() => onAddToCart(product)}
            disabled={outOfStock || adding}
            aria-describedby={nameId}
          >
            {adding ? <span className="spinner" aria-hidden="true" /> : <FaShoppingCart aria-hidden="true" />}
            {adding ? 'Adding…' : 'Add to cart'}
          </button>
        )}
      </div>
    </article>
  )
}

export default ProductCard
