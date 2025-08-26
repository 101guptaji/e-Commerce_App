import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import {Toaster} from 'react-hot-toast';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';

function App() {

  return (
    <Router>
      <Navbar />
      <Toaster position='top-right'/>
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/products/:id' element={<ProductDetails />} />
      </Routes>
    </Router>
  )
}

export default App
