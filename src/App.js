import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './Components/AdminLogin';
import Dashboard from './Components/Dashboard';
import UnderDevelopment from './Components/UnderDevelopment';
import Carousel from './Components/Carousel';
import Users from './Components/Users';
import Offer from './Components/Offer';
import Category from './Components/Category';
import Products from './Components/Products';
import AdminAuth from './Components/AdminAuth';
import OrderItems from './Components/OrderItems';
import Sellers from './Components/Sellers';
import Analytics from './Components/Analytics';
import Coupons from './Components/Coupons';
import Wishlist from './Components/Wishlist';
import Reviews from './Components/Reviews';
import MessagingCenter from './Components/MessagingCenter';
import ProtectedRoute from './Components/ProtectedRoute'; // Import ProtectedRoute

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Route (Login) */}
          <Route path="/" element={<AdminLogin />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/carousel" element={<ProtectedRoute><Carousel /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/offer" element={<ProtectedRoute><Offer /></ProtectedRoute>} />
          <Route path="/category" element={<ProtectedRoute><Category /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminAuth /></ProtectedRoute>} />
          <Route path="/orderitems" element={<ProtectedRoute><OrderItems /></ProtectedRoute>} />
          <Route path="/sellers" element={<ProtectedRoute><Sellers /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><MessagingCenter /></ProtectedRoute>} />

          {/* Catch-all Route */}
          <Route path="*" element={<UnderDevelopment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
