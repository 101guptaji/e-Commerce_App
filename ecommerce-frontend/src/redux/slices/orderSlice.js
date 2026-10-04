import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";
import { logout } from "./authSlice";

export const fetchOrders = createAsyncThunk('order/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get('/orders');
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || {message: 'Failed to fetch orders'});
        }
    }
);

export const placeOrder = createAsyncThunk('order/place',
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.post('/orders');
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || {message: 'Failed to place order'});
        }
    }
);

const initialState = {
    orders: [],
    status: 'idle', // idle | loading | succeeded | failed (order list request)
    error: null,
    placing: false,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, { payload }) => {
                state.status = 'succeeded';
                state.orders = Array.isArray(payload) ? payload : [];
            })
            .addCase(fetchOrders.rejected, (state, { payload }) => {
                state.status = 'failed';
                state.error = payload?.message || 'Failed to fetch orders';
            })
            .addCase(placeOrder.pending, (state) => {
                state.placing = true;
            })
            .addCase(placeOrder.fulfilled, (state) => {
                // The create response isn't populated, so the list is refetched on the Orders page.
                state.placing = false;
                state.orders = [];
                state.status = 'idle';
            })
            .addCase(placeOrder.rejected, (state) => {
                state.placing = false;
            })
            .addCase(logout, () => initialState);
    },
});

export default orderSlice.reducer;
