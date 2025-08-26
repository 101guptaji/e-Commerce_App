import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart,updateCartItem, removeFromCart, clearCart} from '../redux/slices/cartSlice'
import { placeOrder } from '../redux/slices/orderSlice'
import { money } from '../utils/format'
import toast from 'react-hot-toast'
import '../styles/cartStyle.css'

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items=[], loading, error } = useSelector((state) => state.cart);

  useEffect(()=>{
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateCartItem = async (itemId, quantity)=>{
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
      toast.success('Cart item updated successfully');
    } 
    catch (error) {
      toast.error(error.message || 'Failed to update cart item');
    }
  }

  const handleRemoveFromCart = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed from cart successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to remove item from cart');
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      toast.success('Cart cleared successfully');
    } 
    catch (error) {
      toast.error(error.message || 'Failed to clear cart');
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await dispatch(placeOrder()).unwrap();
      toast.success('Order placed successfully');
      navigate('/orders');
    } 
    catch (error) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  const totalAmount = items.reduce((total, item) => total + (item?.product?.price || 0) * item.quantity, 0);

  return (
    <div className='cart-container'>
      <h2>Cart</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {items.length === 0 && !loading && <p>Your cart is empty</p>}
      <ul>
        {items.map(item => (
          <li key={item._id}>
            <h3>{item?.product?.name}</h3>
            <p>{money(item?.product?.price)}</p>
            <p>Quantity: {item.quantity}</p>
            <button onClick={() => handleUpdateCartItem(item._id, item.quantity + 1)}>+</button>
            <button onClick={() => handleUpdateCartItem(item._id, item.quantity - 1)}>-</button>
            <button onClick={() => handleRemoveFromCart(item._id)}>Remove</button>
          </li>
        ))}
      </ul>
      <h3>Total: {money(totalAmount)}</h3>
      <button onClick={handleClearCart}>Clear Cart</button>
      <button onClick={handlePlaceOrder}>Place Order</button>
    </div>
  )
}

export default Cart