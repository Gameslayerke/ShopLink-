import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserShield, FaChartBar, FaImages, FaShoppingCart, FaTags,
  FaTicketAlt, FaTruck, FaMoneyBillAlt, FaBalanceScale, FaBell,
  FaPercent, FaBoxes, FaShoppingBag, FaBox, FaStar,
  FaKey, FaUserCheck, FaStore, FaCreditCard, FaUsers,
  FaWallet, FaHeart
} from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    { name: "Admin", icon: <FaUserShield size={24} />, path: "/admin" },
    { name: "Users", icon: <FaUsers size={24} />, path: "/users" },
    { name: "Carousel Images", icon: <FaImages size={24} />, path: "/carousel" },
    { name: "Categories", icon: <FaTags size={24} />, path: "/category" },
    { name: "Offers", icon: <FaPercent size={24} />, path: "/offer" },
    { name: "Products", icon: <FaBox size={24} />, path: "/products" },
    { name: "Order Items", icon: <FaBoxes size={24} />, path: "/orderitems" },
    { name: "Analytics", icon: <FaChartBar size={24} />, path: "/analytics" },
    { name: "Coupons", icon: <FaTicketAlt size={24} />, path: "/coupons" },
    { name: "Wishlist", icon: <FaHeart size={24} />, path: "/wishlist" },
    { name: "Reviews", icon: <FaStar size={24} />, path: "/reviews" },
    { name: "Notifications", icon: <FaBell size={24} />, path: "/notifications" },
    { name: "Cart Items", icon: <FaShoppingCart size={24} />, path: "/notfound" },
    { name: "Deliveries", icon: <FaTruck size={24} />, path: "/notfound" },
    { name: "Delivery Fees", icon: <FaMoneyBillAlt size={24} />, path: "/notfound" },
    { name: "Disputes", icon: <FaBalanceScale size={24} />, path: "/notfound" },
    { name: "Orders", icon: <FaShoppingBag size={24} />, path: "/notfound" },
    { name: "Roles", icon: <FaKey size={24} />, path: "/notfound" },
    { name: "Seller Verification", icon: <FaUserCheck size={24} />, path: "/notfound" },
    { name: "Transactions", icon: <FaCreditCard size={24} />, path: "/notfound" },
    { name: "Wallet", icon: <FaWallet size={24} />, path: "/notfound" },
    { name: "Wallets", icon: <FaWallet size={24} />, path: "/notfound" },
    { name: "Sellers", icon: <FaStore size={24} />, path: "/notfound" },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <div className="dashboard-grid">
        {dashboardItems.map((item, index) => (
          <div 
            key={index} 
            className="dashboard-card"
            onClick={() => navigate(item.path)}
          >
            <div className="dashboard-icon">{item.icon}</div>
            <h3 className="dashboard-card-title">{item.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;