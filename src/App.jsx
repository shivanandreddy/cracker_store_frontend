import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/auth/Login";
import Dashboard from "./components/Dashboard";

import ProductList from "./pages/products/ProductList";
import AddProduct from "./pages/products/AddProduct";
import EditProduct from "./pages/products/EditProduct";
import DeleteProduct from "./pages/products/DeleteProduct";

import CreateBill from "./pages/billing/CreateBill";
import EditBill from "./pages/billing/EditBill";
import BillDetails from "./pages/billing/BillDetails";
import BillList from "./pages/billing/BillList";

import Reports from "./pages/reports/Reports";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Product Routes */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/products/edit/:id" element={<EditProduct />} />
              <Route path="/products/delete/:id" element={<DeleteProduct />} />

              {/* Billing Routes */}
              <Route path="/billing" element={<BillList />} />
              <Route path="/billing/create" element={<CreateBill />} />
              <Route path="/billing/edit/:id" element={<EditBill />} />
              <Route path="/billing/:id" element={<BillDetails />} />

              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Unknown route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;