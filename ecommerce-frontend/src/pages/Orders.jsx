import { useSelector, useDispatch } from "react-redux";
import { money } from "../utils/format";
import { useEffect } from "react";
import { fetchOrders } from "../redux/slices/orderSlice";
import '../styles/ordersStyle.css'

export const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="orders-container">
      <h1>Orders</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul className="orders-list">
        {orders.map((order) => (
          <li key={order._id} className="order-item">
            <h2>Order ID: {order?._id}</h2>
            <p>Date: {new Date(order?.createdAt).toLocaleDateString()}</p>
            <p>Total Amount: {money(order?.totalAmount)}</p>
            <h3>Items:</h3>
            <ul>
              {order?.items.map((item) => (
                <li key={item._id}>
                  {item?.product?.name} - Quantity: {item?.quantity} - Price: {money(item?.product?.price)}
                </li>
              ))}

            </ul>
          </li>
        ))}
        {orders.length === 0 && <div>No orders yet.</div>}
      </ul>
    </div>
  )
}
