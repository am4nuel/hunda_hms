import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RestaurantPage from './pages/RestaurantPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import ScrollToTop from './components/ScrollToTop';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" richColors />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/activities" element={<RestaurantPage />} />
        <Route path="/restaurant" element={<RestaurantPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
