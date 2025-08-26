import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchProductById } from '../redux/slices/productSlice'
import { addToCart } from '../redux/slices/cartSlice'
import { money } from '../utils/format'
import toast from 'react-hot-toast'
import '../styles/productDetailsStyle.css'

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: current._id, quantity: 1 })).unwrap();
      toast.success('Product added to cart');
    }
    catch (error) {
      toast.error(error?.message || 'Failed to add product to cart');
    }
  };

  if (loading || !current) {
    return <div>Loading...</div>;
  }

  return (
    <div className='product-details'>
      <div className='product-img'>
        {current.image ?
        <img
          src={current.image}
          alt={current.name} />
        : <div className="placeholder-img">No Image Available</div>
      }
      </div>
      <div className="product-description">
        <h2>{current.name}</h2>
        <p>{current.category}</p>
        <p>{current.description}</p>
        <p>{money(current.price)}</p>
        <button onClick={handleAddToCart}>Add to Cart</button>
      </div>

    </div>
  )
}

export default ProductDetails