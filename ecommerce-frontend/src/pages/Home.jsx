import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import '../styles/homeStyle.css'

const Home = () => {
  const dispatch = useDispatch();
  const { items, page, pages, loading } = useSelector(state => state.products);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ page: 1 }))
  }, [dispatch]);

  const onPageChange = (p) => {
    dispatch(fetchProducts({ page: p, search }))
  }

  const onSearch = () => {
    dispatch(fetchProducts({ page: 1, search }))
  }

  const addCart = async (p) => {
    try {
      await dispatch(addToCart({ productId: p._id })).unwrap();
      toast.success('Added to cart');
    }
    catch (error) {
      toast.error(error?.message || 'Failed to add to cart');
    }
  }

  return (
    <div className='homepage'>
      <div className="searchbar">
        <input type="text"
          name='search'
          value={search}
          placeholder='Search products'
          onChange={e => setSearch(e.target.value)}
        />
        <button className='btn' onClick={onSearch}>Search</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <>
          <div className="products-list">
            {items.map(p => <ProductCard key={p._id} product={p} addCart={addCart} />)}
          </div>
          <Pagination page={page} pages={pages} onChange={onPageChange} />
        </>
      )}
    </div>
  )
}

export default Home