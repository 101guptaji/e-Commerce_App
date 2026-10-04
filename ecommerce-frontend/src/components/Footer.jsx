import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaBoxOpen, FaShoppingCart, FaTruck } from 'react-icons/fa';
import { categoryLink, getCategoryMeta } from '../utils/categories';
import '../styles/footerStyle.css';

const Footer = () => {
  const categories = useSelector((state) => state.products.categories);
  const year = new Date().getFullYear();

  return (
    <footer className="ftr">
      <div className="ftr__inner">
        <div className="ftr__brand">
          <p className="ftr__logo">
            <span className="ftr__logo-mark">HG</span>{' '}
            <span>Shop<span className="ftr__logo-dot">.</span></span>
          </p>
          <p className="ftr__about">
            Electronics, fashion and jewellery in one place, with free delivery on every order.
          </p>
        </div>

        <nav className="ftr__col" aria-label="Shop">
          <h2 className="ftr__heading">Shop</h2>
          <ul>
            <li><Link to="/products">All products</Link></li>
            {categories.slice(0, 6).map((category) => (
              <li key={category}>
                <Link to={categoryLink(category)}>{getCategoryMeta(category).label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="ftr__col" aria-label="Your account">
          <h2 className="ftr__heading">Your account</h2>
          <ul>
            <li><Link to="/profile">My profile</Link></li>
            <li><Link to="/orders">My orders</Link></li>
            <li><Link to="/cart">My cart</Link></li>
          </ul>
        </nav>

        <div className="ftr__col">
          <h2 className="ftr__heading">Why shop with us</h2>
          <ul className="ftr__perks">
            <li><FaTruck aria-hidden="true" /> Free delivery on every order</li>
            <li><FaShoppingCart aria-hidden="true" /> Live stock on every product</li>
            <li><FaBoxOpen aria-hidden="true" /> Track orders from your account</li>
          </ul>
        </div>
      </div>

      <div className="ftr__bottom">
        <p>© {year} HG Shop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
