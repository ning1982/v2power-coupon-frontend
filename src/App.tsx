import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RedeemPage from "./pages/RedeemPage";
import SuccessPage from "./pages/SuccessPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPage from "./pages/PrivacyPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import ImportView from "./pages/admin/ImportView";

const ENABLE_ADMIN = import.meta.env.VITE_ENABLE_ADMIN === "true";

export default function App() {
  return (
    <BrowserRouter basename="/coupon">
      <Routes>
        <Route path="/" element={<RedeemPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        {ENABLE_ADMIN ? (
          <>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="import" replace />} />
              <Route path="import" element={<ImportView />} />
            </Route>
          </>
        ) : (
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}