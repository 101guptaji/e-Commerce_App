import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast';
import {
  FaBoxOpen,
  FaEdit,
  FaExclamationTriangle,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrashAlt
} from 'react-icons/fa'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../redux/slices/productSlice'
import useDebounce from '../hooks/useDebounce'
import ProductImage from '../components/ProductImage'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/Skeletons'
import { money } from '../utils/format'
import { getCategoryMeta } from '../utils/categories'
import '../styles/adminProductStyle.css'

const ADMIN_PAGE_SIZE = 10;
const LOW_STOCK_LIMIT = 5;
const EMPTY_FORM = { name: '', category: '', price: '', stock: '', image: '', description: '' };

const getStockTone = (stock) => {
  if (stock <= 0) return 'pill-danger';
  if (stock <= LOW_STOCK_LIMIT) return 'pill-warning';
  return 'pill-success';
};

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { items, pages, total, status, error, saving, categories } = useSelector(state => state.products);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const previewSrc = useDebounce(formData.image.trim(), 400);
  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProducts({ page, search: debouncedSearch, limit: ADMIN_PAGE_SIZE }));
  }, [dispatch, page, debouncedSearch]);

  const reloadPage = (targetPage = page) =>
    dispatch(fetchProducts({ page: targetPage, search: debouncedSearch, limit: ADMIN_PAGE_SIZE }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      image: product.image || '',
      description: product.description || '',
    });
    formRef.current?.scrollIntoView({ block: 'start' });
    nameInputRef.current?.focus({ preventScroll: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description.trim(),
      image: formData.image.trim(),
    };

    let validationError = '';
    if (!payload.name) validationError = 'Please enter a product name.';
    else if (formData.price === '' || !Number.isFinite(payload.price) || payload.price < 0) validationError = 'Please enter a valid price.';
    else if (formData.stock === '' || !Number.isInteger(payload.stock) || payload.stock < 0) validationError = 'Stock must be a whole number of 0 or more.';
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      if (editingId) {
        await dispatch(updateProduct({ id: editingId, data: payload })).unwrap();
        toast.success('Product updated');
        resetForm();
        return;
      }

      const { image, ...createData } = payload;
      const created = await dispatch(createProduct(createData)).unwrap();
      // POST /products ignores `image`, so attach it with a follow-up update.
      if (image && created?._id) {
        try {
          await dispatch(updateProduct({ id: created._id, data: { image } })).unwrap();
        } catch {
          toast.error('Product created, but the image could not be saved. Edit the product to try again.');
        }
      }
      toast.success('Product created');
      resetForm();
      // New products are listed first, so show page 1.
      if (page === 1) reloadPage(1);
      else setPage(1);
    }
    catch (error) {
      toast.error(error?.message || 'Failed to save product.');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteProduct(toDelete._id)).unwrap();
      toast.success('Product deleted');
      if (editingId === toDelete._id) resetForm();
      setToDelete(null);
      // Refill the current page, or step back if it is now empty.
      if (items.length === 1 && page > 1) setPage(page - 1);
      else reloadPage();
    }
    catch (error) {
      toast.error(error?.message || 'Failed to delete product.');
    }
    finally {
      setDeleting(false);
    }
  };

  const isLoading = status === 'idle' || (status === 'loading' && items.length === 0);
  const submitIcon = editingId ? <FaEdit aria-hidden="true" /> : <FaPlus aria-hidden="true" />;

  let list;
  if (isLoading) {
    list = (
      <div role="status">
        <span className="visually-hidden">Loading products…</span>
        <ul className="adm__list" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="adm__row">
              <span className="skeleton adm__thumb-wrap" />
              <div className="adm__row-main">
                <Skeleton width="70%" height={14} />
                <Skeleton width="30%" height={12} style={{ marginTop: 8 }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (status === 'failed' && items.length === 0) {
    list = (
      <EmptyState
        icon={FaExclamationTriangle}
        title="Couldn't load products"
        message={error || 'Please try again.'}
        action={<button type="button" className="btn btn-primary" onClick={() => reloadPage()}>Try again</button>}
      />
    );
  } else if (items.length === 0) {
    list = (
      <EmptyState
        icon={debouncedSearch ? FaSearch : FaBoxOpen}
        title={debouncedSearch ? 'No products match your search' : 'No products yet'}
        message={debouncedSearch ? 'Try a different product name.' : 'Use the form to add your first product.'}
      />
    );
  } else {
    list = (
      <ul className="adm__list">
        {items.map(item => {
          const stock = Number(item.stock) || 0;
          return (
            <li key={item._id} className={`adm__row${editingId === item._id ? ' is-editing' : ''}`}>
              <span className="adm__thumb-wrap">
                <ProductImage src={item.image} alt="" className="adm__thumb" />
              </span>
              <div className="adm__row-main">
                <Link to={`/products/${item._id}`} className="adm__name">{item.name}</Link>
                <p className="adm__meta">{getCategoryMeta(item.category).label}</p>
              </div>
              <div className="adm__figures">
                <span className="adm__price">{money(item.price)}</span>
                <span className={`pill ${getStockTone(stock)}`}>
                  {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="adm__actions">
                <button
                  type="button"
                  className="adm__icon-btn"
                  onClick={() => handleEdit(item)}
                  aria-label={`Edit ${item.name}`}
                  title="Edit"
                >
                  <FaEdit aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="adm__icon-btn adm__icon-btn--danger"
                  onClick={() => setToDelete(item)}
                  aria-label={`Delete ${item.name}`}
                  title="Delete"
                >
                  <FaTrashAlt aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className='page adm'>
      <div className="adm__header card">
        <div>
          <h1 className="adm__title">Product Dashboard</h1>
          <p className="adm__subtitle">Add, edit and manage the products in your store.</p>
        </div>
        <dl className="adm__stats">
          <div className="adm__stat">
            <dt>{debouncedSearch ? 'Matching products' : 'Products'}</dt>
            <dd>{status === 'succeeded' ? total : '—'}</dd>
          </div>
          <div className="adm__stat">
            <dt>Categories</dt>
            <dd>{categories.length}</dd>
          </div>
        </dl>
      </div>

      <div className="adm__layout">
        <form ref={formRef} className='adm__form card' onSubmit={handleSubmit} aria-labelledby="adm-form-title">
          <div className="adm__form-head">
            <h2 id="adm-form-title" className="adm__form-title">
              {editingId ? 'Edit product' : 'Add a new product'}
            </h2>
            {editingId && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
                <FaTimes aria-hidden="true" /> Cancel
              </button>
            )}
          </div>

          <div className="field">
            <label htmlFor="adm-name">Product name</label>
            <input
              ref={nameInputRef}
              id="adm-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Wireless headphones"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="adm-category">Category</label>
            <input
              id="adm-category"
              type="text"
              name="category"
              list="adm-category-options"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. electronics"
              required
            />
            <datalist id="adm-category-options">
              {categories.map((category) => <option key={category} value={category} />)}
            </datalist>
            <p className="field-hint">Reuse an existing category to group products on the storefront.</p>
          </div>

          <div className="adm__form-row">
            <div className="field">
              <label htmlFor="adm-price">Price (₹)</label>
              <input
                id="adm-price"
                type="number"
                name="price"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="adm-stock">Stock</label>
              <input
                id="adm-stock"
                type="number"
                name="stock"
                min="0"
                step="1"
                inputMode="numeric"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="adm-image">Image URL <span className="adm__optional">(optional)</span></label>
            <div className="adm__image-field">
              <input
                id="adm-image"
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
              />
              <ProductImage src={previewSrc} alt="" className="adm__preview" loading="eager" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="adm-description">Description</label>
            <textarea
              id="adm-description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Key features, materials, size…"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block adm__submit" disabled={saving}>
            {saving ? <span className="spinner" aria-hidden="true" /> : submitIcon}
            {editingId ? 'Save changes' : 'Add product'}
          </button>
        </form>

        <section className="adm__list-card card" aria-labelledby="adm-list-title">
          <div className="adm__toolbar">
            <h2 id="adm-list-title" className="adm__list-title">All products</h2>
            <div className="adm__search">
              <FaSearch aria-hidden="true" />
              <label htmlFor="adm-search" className="visually-hidden">Search products</label>
              <input
                id="adm-search"
                type="search"
                placeholder="Search products by name"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {list}

          {status === 'succeeded' && <Pagination page={page} pages={pages} onChange={setPage} />}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product"
        message={`"${toDelete?.name || 'This product'}" will be removed from the store. Carts and past orders that include it will show it as unavailable.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setToDelete(null);
        }}
      />
    </div>
  )
}

export default AdminProducts
