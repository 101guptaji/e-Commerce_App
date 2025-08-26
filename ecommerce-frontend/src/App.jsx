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

  return (
    <Router>
      <Navbar />
      <Toaster position='top-right' />
      <div className="container">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/admin' element={<AdminProducts />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
