import { BrowserRouter, Routes, Route } from "react-router-dom";
import RedeemPage from "./pages/RedeemPage";
import SuccessPage from "./pages/SuccessPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPage from "./pages/PrivacyPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import BatchesView from "./pages/admin/BatchesView";
import ImportView from "./pages/admin/ImportView";
import BatchDetailView from "./pages/admin/BatchDetailView";
import PrintView from "./pages/admin/PrintView";

export default function App() {
  return (
    <BrowserRouter basename="/coupon">
      <Routes>
        <Route path="/" element={<RedeemPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<BatchesView />} />
          <Route path="import" element={<ImportView />} />
          <Route path="batch/:id" element={<BatchDetailView />} />
          <Route path="print/:id" element={<PrintView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
