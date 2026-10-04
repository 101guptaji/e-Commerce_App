import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addToCart } from '../redux/slices/cartSlice';

/**
 * Shared "add to cart" behaviour for product cards and the product page.
 * - Guests are sent to the login page and brought back afterwards.
 * - `pendingId` lets buttons show a spinner for the product being added.
 * - `isInCart` lets buttons switch to "Go to cart".
 */
export default function useAddToCart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const token = useSelector((state) => state.auth.token);
    const cartItems = useSelector((state) => state.cart.items);
    const [pendingId, setPendingId] = useState(null);

    const cartProductIds = useMemo(
        () => new Set((cartItems || []).map((item) => item?.product?._id).filter(Boolean)),
        [cartItems]
    );

    const isInCart = useCallback((productId) => cartProductIds.has(productId), [cartProductIds]);

    const addItem = useCallback(async (product, { goToCart = false } = {}) => {
        if (!token) {
            toast('Please log in to add items to your cart');
            navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
            return false;
        }

        setPendingId(product._id);
        try {
            await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
            if (goToCart) {
                navigate('/cart');
            } else {
                toast.success('Added to your cart');
            }
            return true;
        }
        catch (error) {
            toast.error(error?.message || 'Could not add this item to your cart');
            return false;
        }
        finally {
            setPendingId(null);
        }
    }, [dispatch, navigate, location.pathname, location.search, token]);

    return { addItem, isInCart, pendingId };
}
