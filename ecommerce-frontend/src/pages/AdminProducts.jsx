import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../redux/slices/productSlice'
import toast from 'react-hot-toast';
import '../styles/adminProductStyle.css'

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.products);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    stock: ''
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await dispatch(updateProduct({id: formData._id, data: formData})).unwrap();
      }
      else {
        await dispatch(createProduct(formData)).unwrap();
      }
      toast.success('Product saved successfully!');

      setFormData({
        name: '',
        category: '',
        price: '',
        description: '',
        stock: ''
      });
    }
    catch (error) {
      toast.error(error?.message || 'Failed to save product.');
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('ID: ', id);
        await dispatch(deleteProduct(id)).unwrap();
        toast.success('Product deleted successfully!');
      }
      catch (error) {
        toast.error(error?.message || 'Failed to delete product.');
      }
    }
  };

  return (
    <div className='admin-products'>
      <form className='admin-product-form' onSubmit={handleSubmit}>
        <h2>{formData._id ? 'Edit Product' : 'Create Product'}</h2>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required />
        <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required></textarea>
        <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" required />
        <button type="submit">{formData._id ? 'Update' : 'Create'} Product</button>
      </form>
      <div className='admin-product-list'>
        <h2>Product List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {items.map(item => (
              <li key={item._id}>
                <div>
                  <div>{item.name}</div>
                  <div >{item.category} • ₹{item.price} • stock {item.stock}</div>
                </div>
                <div className='btns'>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AdminProducts