import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

export const fetchOrders = createAsyncThunk('order/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get('/orders');
            console.log("orders: ",res.data)
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

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.orders = payload;
            })
            .addCase(fetchOrders.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Failed to fetch orders';
            })
            .addCase(placeOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(placeOrder.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.orders = [...state.orders, payload];
            })
            .addCase(placeOrder.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Failed to place order';
            });
    },
});

export default orderSlice.reducer;
