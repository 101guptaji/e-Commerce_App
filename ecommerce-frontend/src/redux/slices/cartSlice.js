import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

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

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.items = payload.items;
            })
            .addCase(fetchCart.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Fetch cart failed';
            })
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.items.push(payload.item);
            })
            .addCase(addToCart.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Add to cart failed';
            })
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, { payload }) => {
                state.loading = false;
                const item = state.items.find(item => item.id === payload.id);
                if (item) {
                    item.quantity = payload.quantity;
                    item.price = payload.price;
                }
            })
            .addCase(updateCartItem.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Update cart item failed';
            })
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.items = state.items.filter(item => item.id !== payload.id);
            })
            .addCase(removeFromCart.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Remove from cart failed';
            })
            .addCase(clearCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.totalQuantity = 0;
                state.totalPrice = 0;
            })
            .addCase(clearCart.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Clear cart failed';
            });
    },
});

export default cartSlice.reducer;