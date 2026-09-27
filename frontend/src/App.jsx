import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ProtectedRoute, AdminRoute } from "./components/RouteGuards.jsx";
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import AuthModal from "./components/AuthModal.jsx";

import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Cart from "./pages/Cart.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import MyLibrary from "./pages/MyLibrary.jsx";
import Reader from "./pages/Reader.jsx";
import SampleReader from "./pages/SampleReader.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import RefundPolicy from "./pages/RefundPolicy.jsx";
import Terms from "./pages/Terms.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import Templates from "./pages/Templates.jsx";
import TemplateDetail from "./pages/TemplateDetail.jsx";

export default function App() {
  return (
    <AuthModalProvider>
      <div className="flex min-h-screen flex-col bg-ink">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/template/:id" element={<TemplateDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />

            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <MyLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/read/:id"
              element={
                <ProtectedRoute>
                  <Reader />
                </ProtectedRoute>
              }
            />
            {/* Public: no login required, matching the KDP "read sample" pattern */}
            <Route path="/sample/:id" element={<SampleReader />} />
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
        <AuthModal />
      </div>
    </AuthModalProvider>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-ivory">Page not found</h1>
      <p className="mt-4 text-ivory/60">The page you're looking for doesn't exist.</p>
    </div>
  );
}