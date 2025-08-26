import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const registerUser = createAsyncThunk('auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const res = await API.post('/auth/register', userData);
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Register failed' })
        }
    });

export const loginUser = createAsyncThunk('auth/login',
    async (userData, { rejectWithValue }) => {
        try {
            const res = await API.post('/auth/login', userData);
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Login failed' })
        }
    });

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token') || null,
        role: localStorage.getItem('role') || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, {payload}) => {
                state.loading = false;
                state.error = payload?.message || 'Register failed';
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, {payload}) => {
                state.loading = false;
                state.user = payload.user;
                state.token = payload.token;
                state.role = payload.user?.role;
            })
            .addCase(loginUser.rejected, (state, {payload}) => {
                state.loading = false;
                state.error = payload?.message || 'Login failed';
            });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
