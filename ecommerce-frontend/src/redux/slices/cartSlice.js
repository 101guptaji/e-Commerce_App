import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';
import { logout } from './authSlice';
import { placeOrder } from './orderSlice';

export const fetchCart = createAsyncThunk('cart/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get('/cart');
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Fetch cart failed' })
        }
    }
)

export const addToCart = createAsyncThunk('cart/add',
    async ({ productId, quantity = 1 }, { rejectWithValue }) => {
        try {
            const res = await API.post('/cart', { productId, quantity });
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Add to cart failed' })
        }
    }
)

export const updateCartItem = createAsyncThunk('cart/update',
    async ({ itemId, quantity }, { rejectWithValue }) => {
        try {
            const res = await API.put(`/cart/${itemId}`, { quantity });
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Update cart item failed' })
        }
    }
)

export const removeFromCart = createAsyncThunk('cart/remove',
    async (itemId, { rejectWithValue }) => {
        try {
            const res = await API.delete(`/cart/${itemId}`);
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Remove from cart failed' })
        }
    }
)

export const clearCart = createAsyncThunk('cart/clear',
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.delete('/cart');
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Clear cart failed' })
        }
    }
)

const initialState = {
    items: [],
    status: 'idle', // idle | loading | succeeded | failed (cart fetch)
    error: null,
};

// Every cart endpoint (including POST /cart) responds with the whole cart document.
const applyCart = (state, payload) => {
    state.items = Array.isArray(payload?.items) ? payload.items : [];
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, { payload }) => {
                state.status = 'succeeded';
                applyCart(state, payload);
            })
            .addCase(fetchCart.rejected, (state, { payload }) => {
                state.status = 'failed';
                state.error = payload?.message || 'Fetch cart failed';
            })
            .addCase(addToCart.fulfilled, (state, { payload }) => {
                applyCart(state, payload);
            })
            .addCase(updateCartItem.fulfilled, (state, { payload }) => {
                applyCart(state, payload);
            })
            .addCase(removeFromCart.fulfilled, (state, { payload }) => {
                applyCart(state, payload);
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
            })
            // The server empties the cart as part of checkout.
            .addCase(placeOrder.fulfilled, (state) => {
                state.items = [];
            })
            .addCase(logout, () => initialState);
    },
});

export const selectCartCount = (state) =>
    state.cart.items.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);

export default cartSlice.reducer;
