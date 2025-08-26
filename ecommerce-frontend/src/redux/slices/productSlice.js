import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchProducts = createAsyncThunk("products/fetch", 
    async ({page=1, search='', category=''}={}, {rejectWithValue})=>
        {
            try {
                const res = await API.get(`/products?page=${page}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
                
                // console.log(res, res.data);
                return res.data;
            } 
            catch (error) {
                return rejectWithValue(error.response?.data || {message: 'fetch failed'});
            }
})

export const fetchProductById = createAsyncThunk('products/getById',
    async (id, {rejectWithValue}) =>{
        try {
            const res = await API.get(`/products/${id}`);
            return res.data;    
        } 
        catch (error) {
            return rejectWithValue(error.response?.data || {message: 'fetch failed'});
        }
    }
)

const initialState = {
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    current: null,
    loading: false,
    error: null
}

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder)=>{
        builder.addCase(fetchProducts.pending, (state)=>{
            state.loading = true;
            state.error=null
        })
        .addCase(fetchProducts.fulfilled, (state, action)=>{
            state.loading = false;
            state.items = action.payload.products;
            state.page = action.payload.page;
            state.pages = action.payload.pages;
            state.total = action.payload.total;
        })
        .addCase(fetchProducts.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload?.message || 'Error';
        })
        .addCase(fetchProductById.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProductById.fulfilled, (state, action)=>{
            state.loading = false;
            state.current = action.payload;
        })
        .addCase(fetchProductById.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload?.message || 'Error';
        })
    }
})

export default productSlice.reducer;