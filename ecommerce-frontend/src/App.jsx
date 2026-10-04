import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { PrivateRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import { Orders } from './pages/Orders';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminProducts from './pages/AdminProducts';
import NotFound from './pages/NotFound';
import { fetchCatalog } from './redux/slices/productSlice';
import { fetchCart } from './redux/slices/cartSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const catalogStatus = useSelector((state) => state.products.catalogStatus);

  // Categories, home sections and "similar products" read from one catalog snapshot.
  // Admin changes reset its status to 'idle', which refreshes it here.
  useEffect(() => {
    if (catalogStatus === 'idle') dispatch(fetchCatalog());
  }, [catalogStatus, dispatch]);

  // Keep the header cart badge in sync with the signed-in user's cart.
  useEffect(() => {
    if (token) dispatch(fetchCart());
  }, [token, dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="app-shell">
        <Navbar />
        <main id="main-content" className="app-main" tabIndex={-1}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/products' element={<Products />} />
            <Route path='/products/:id' element={<ProductDetails />} />
            <Route path='/register' element={<GuestRoute><Register /></GuestRoute>} />
            <Route path='/login' element={<GuestRoute><Login /></GuestRoute>} />
            <Route path='/cart' element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path='/orders' element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path='/admin' element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position='bottom-center'
        containerStyle={{ bottom: 80 }}
        toastOptions={{
          duration: 2500,
          style: {
            background: '#18181b',
            color: '#fff',
            borderRadius: '999px',
            boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.55)',
            fontSize: '14px',
            fontWeight: 600,
            padding: '10px 18px',
          },
          success: { iconTheme: { primary: '#ff4d5a', secondary: '#18181b' } },
          error: { iconTheme: { primary: '#ff4d5a', secondary: '#18181b' } },
        }}
      />
    </Router>
  )
}

export default App
