import { Link } from "react-router-dom"
import { money } from '../utils/format';
import '../styles/productCardStyle.css'

const ProductCard = ({ product, addCart }) => {
  return (
    <div className="productCard">
      {product.image ?
        <img
          className="product-img"
          src={product.image}
          alt={product.name} />
        : <div className="placeholder-img">No Image Available</div>
      }
      <Link
        to={`/products/${product._id}`}
        className="product-name">
        {product.name}
      </Link>
      <div className="product-category">{product.category}</div>
      <div className="product-money">{money(product.price)}</div>
      <button className="add-cart-btn" onClick={() => addCart(product)}>Add to cart</button>
    </div>
  )
}

export default ProductCard