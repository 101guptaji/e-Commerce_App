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

export const createProduct = createAsyncThunk('products/create',
    async (productData, {rejectWithValue}) =>{
        try {
            const res = await API.post('/products', productData);
            return res.data;
        } 
        catch (error) {
            return rejectWithValue(error.response?.data || {message: 'Create product failed'});
        }
    }
)

export const updateProduct = createAsyncThunk('products/update',
    async ({id, data}, {rejectWithValue}) =>{
        console.log('ID: ', id, 'Product Data: ', data);
        try {
            const res = await API.put(`/products/${id}`, data);
            // console.log("response from updateProduct: ", res);
            return res.data;
        } 
        catch (error) {
            return rejectWithValue(error.response?.data || {message: 'Update product failed'});
        }
    }
)

export const deleteProduct = createAsyncThunk('products/delete',
    async (id, {rejectWithValue}) =>{
        try {
            console.log('ID: ', id);
            const res = await API.delete(`/products/${id}`);
            console.log("response from deleteProduct: ", res);
            return res.data;
        } 
        catch (error) {
            return rejectWithValue(error.response?.data || {message: 'Delete product failed'});
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
        .addCase(createProduct.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(createProduct.fulfilled, (state, action)=>{
            state.loading = false;
            state.items = [...state.items, action.payload];
        })
        .addCase(createProduct.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload?.message || 'Error';
        })
        .addCase(updateProduct.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(updateProduct.fulfilled, (state, action)=>{
            state.loading = false;
            state.items = state.items.map(item => item._id === action.payload._id ? action.payload : item);
        })
        .addCase(updateProduct.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload?.message || 'Error';
        })
        .addCase(deleteProduct.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteProduct.fulfilled, (state, action)=>{
            state.loading = false;
            state.items = state.items.filter(item => item._id !== action.payload._id);
        })
        .addCase(deleteProduct.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload?.message || 'Error';
        })
    }
})

export default productSlice.reducer;