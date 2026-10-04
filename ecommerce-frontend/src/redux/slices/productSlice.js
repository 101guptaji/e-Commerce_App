import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import API from '../../api/axios';
import { escapeRegex } from '../../utils/search';

export const PRODUCTS_PAGE_SIZE = 12;

// The API has no categories endpoint, so the storefront loads one bounded catalog
// snapshot and derives the category list and home-page sections from it.
const CATALOG_LIMIT = 100;

const buildProductQuery = ({ page = 1, limit = PRODUCTS_PAGE_SIZE, search = '', category = '' } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const term = String(search ?? '').trim();
    if (term) params.set('search', escapeRegex(term));
    if (category) params.set('category', category);
    return params.toString();
};

export const fetchProducts = createAsyncThunk("products/fetch",
    async (query = {}, {rejectWithValue})=>
        {
            try {
                const res = await API.get(`/products?${buildProductQuery(query)}`);
                return res.data;
            }
            catch (error) {
                return rejectWithValue(error.response?.data || {message: 'fetch failed'});
            }
})

export const fetchCatalog = createAsyncThunk('products/fetchCatalog',
    async (_, {rejectWithValue}) => {
        try {
            const res = await API.get(`/products?${buildProductQuery({ page: 1, limit: CATALOG_LIMIT })}`);
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || {message: 'fetch failed'});
        }
    },
    // Skip duplicate requests (e.g. React StrictMode running effects twice).
    { condition: (_, { getState }) => getState().products.catalogStatus !== 'loading' }
)

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
        try {
            const res = await API.put(`/products/${id}`, data);
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
            const res = await API.delete(`/products/${id}`);
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || {message: 'Delete product failed'});
        }
    }
)

const initialState = {
    // Paginated listing (products page + admin table)
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    latestRequestId: null,

    // Product details page
    current: null,
    currentId: null,
    currentStatus: 'idle',
    currentError: null,
    currentRequestId: null,

    // Catalog snapshot for categories, home sections and "similar products"
    catalog: [],
    categories: [],
    catalogStatus: 'idle',
    catalogError: null,

    // Admin create/update in flight
    saving: false,
}

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder)=>{
        builder.addCase(fetchProducts.pending, (state, action)=>{
            state.status = 'loading';
            state.error = null;
            state.latestRequestId = action.meta.requestId;
        })
        .addCase(fetchProducts.fulfilled, (state, action)=>{
            // Ignore responses from requests that were superseded (fast typing / filter changes).
            if (action.meta.requestId !== state.latestRequestId) return;
            state.status = 'succeeded';
            state.items = action.payload.products || [];
            state.page = action.payload.page || 1;
            state.pages = Math.max(1, action.payload.pages || 1);
            state.total = action.payload.total || 0;
        })
        .addCase(fetchProducts.rejected, (state, action)=>{
            if (action.meta.requestId !== state.latestRequestId) return;
            state.status = 'failed';
            state.error = action.payload?.message || 'Could not load products';
        })
        .addCase(fetchCatalog.pending, (state)=>{
            state.catalogStatus = 'loading';
            state.catalogError = null;
        })
        .addCase(fetchCatalog.fulfilled, (state, action)=>{
            const products = action.payload.products || [];
            state.catalog = products;
            state.categories = [...new Set(products.map((p) => p.category).filter(Boolean))]
                .sort((a, b) => a.localeCompare(b));
            state.catalogStatus = 'succeeded';
        })
        .addCase(fetchCatalog.rejected, (state, action)=>{
            state.catalogStatus = 'failed';
            state.catalogError = action.payload?.message || 'Could not load products';
        })
        .addCase(fetchProductById.pending, (state, action)=>{
            state.currentId = action.meta.arg;
            state.currentRequestId = action.meta.requestId;
            state.currentStatus = 'loading';
            state.currentError = null;
        })
        .addCase(fetchProductById.fulfilled, (state, action)=>{
            if (action.meta.requestId !== state.currentRequestId) return;
            state.current = action.payload;
            state.currentStatus = 'succeeded';
        })
        .addCase(fetchProductById.rejected, (state, action)=>{
            if (action.meta.requestId !== state.currentRequestId) return;
            state.currentStatus = 'failed';
            state.currentError = action.payload?.message || 'Product not found';
        })
        .addCase(createProduct.pending, (state)=>{
            state.saving = true;
        })
        .addCase(createProduct.fulfilled, (state)=>{
            state.saving = false;
            state.catalogStatus = 'idle'; // catalog snapshot is stale; App refetches it
        })
        .addCase(createProduct.rejected, (state)=>{
            state.saving = false;
        })
        .addCase(updateProduct.pending, (state)=>{
            state.saving = true;
        })
        .addCase(updateProduct.fulfilled, (state, action)=>{
            state.saving = false;
            state.items = state.items.map(item => item._id === action.payload._id ? action.payload : item);
            if (state.current?._id === action.payload._id) state.current = action.payload;
            state.catalogStatus = 'idle';
        })
        .addCase(updateProduct.rejected, (state)=>{
            state.saving = false;
        })
        .addCase(deleteProduct.fulfilled, (state, action)=>{
            state.items = state.items.filter(item => item._id !== action.payload._id);
            state.catalogStatus = 'idle';
        })
    }
})

export default productSlice.reducer;
