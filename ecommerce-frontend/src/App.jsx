import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import { Orders } from './pages/Orders';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminProducts from './pages/AdminProducts';
import './App.css';

function App() {
  const PrivateRoute = ({children})=>{
    const token = localStorage.getItem('token');
    if(!token) {
      return <Navigate to="/login" />;
    }
    return children;
  }

  const AdminRoute = ({children})=>{
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if(!token || role !== 'admin') {
      return <Navigate to="/" />;
    }
    return children;
  }

  return (
    <Router>
      <Navbar />
      <Toaster position='top-right' />
      <div className="container">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products/:id' element={<ProductDetails />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/cart' element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path='/orders' element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path='/admin' element={<AdminRoute><AdminProducts /></AdminRoute>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
