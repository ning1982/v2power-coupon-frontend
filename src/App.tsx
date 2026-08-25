import { BrowserRouter, Routes, Route } from "react-router-dom";
import RedeemPage from "./pages/RedeemPage";
import SuccessPage from "./pages/SuccessPage";
import HelpPage from "./pages/HelpPage";

export default function App() {
  return (
    <BrowserRouter basename="/coupon">
      <Routes>
        <Route path="/" element={<RedeemPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </BrowserRouter>
  );
}
