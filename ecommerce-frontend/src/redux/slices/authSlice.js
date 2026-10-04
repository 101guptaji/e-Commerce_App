import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Restore the signed-in user's profile (name, email, role) after a page reload.
const readStoredUser = () => {
    try {
        const stored = localStorage.getItem('user');
        if (stored) return JSON.parse(stored);
    }
    catch {
        // Ignore malformed data and fall back to the token payload below.
    }

    // Sessions created before the profile was persisted: use the JWT payload.
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return { id: payload.id, email: payload.email, role: payload.role };
    }
    catch {
        return null;
    }
};

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
        user: readStoredUser(),
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
            localStorage.removeItem('user');
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
            .addCase(registerUser.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Register failed';
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.user = payload.user;
                state.token = payload.token;
                state.role = payload.user?.role;
                localStorage.setItem('token', payload.token);
                localStorage.setItem('role', payload.user?.role);
                localStorage.setItem('user', JSON.stringify(payload.user ?? null));
            })
            .addCase(loginUser.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message || 'Login failed';
            });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
