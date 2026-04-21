import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BottomNavBar } from "@/components/BottomNavBar";
import { NotificationModalProvider } from "@/hooks/use-notification-modal";
import { BackButtonHandler } from "@/components/BackButtonHandler";
import { DeepLinkHandler } from "@/components/DeepLinkHandler";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import Home from "./pages/Home";
import Clients from "./pages/Clients";
import ClientEdit from "./pages/ClientEdit";
import Energy from "./pages/Energy";
import Realtime from "./pages/Realtime";
import RealtimeHistory from "./pages/RealtimeHistory";
import Destiny from "./pages/Destiny";
import DestinyHistory from "./pages/DestinyHistory";
import DestinyReport from "./pages/DestinyReport";
import Chat from "./pages/Chat";
import ChatHistory from "./pages/ChatHistory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSettings from "./pages/ProfileSettings";
import UserProfile from "./pages/UserProfile";
import Pricing from "./pages/Pricing";
import BranchRelations from "./pages/BranchRelations";
import BaziEncyclopedia from "./pages/BaziEncyclopedia";
import EnergyEncyclopedia from "./pages/EnergyEncyclopedia";
import QimenEncyclopedia from "./pages/QimenEncyclopedia";
import LiuYaoEncyclopedia from "./pages/LiuYaoEncyclopedia";
import SiHaiEncyclopedia from "./pages/SiHaiEncyclopedia";
import Synastry from "./pages/Synastry";
import SynastryHistory from "./pages/SynastryHistory";
import WealthEncyclopedia from "./pages/WealthEncyclopedia";
import SpendingEncyclopedia from "./pages/SpendingEncyclopedia";
import SpeechEncyclopedia from "./pages/SpeechEncyclopedia";
import EnergyHistory from "./pages/EnergyHistory";
import ResetPassword from "./pages/ResetPassword";

import Calendar from "./pages/Calendar";
import FlyingStars from "./pages/FlyingStars";
import Landing from "./pages/Landing";
import WuxingMarketing from "./pages/WuxingMarketing";
import Terms from "./pages/Terms";
import Store from "./pages/Store";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import ProductEdit from "./pages/ProductEdit";
import ProductDetail from "./pages/ProductDetail";
import OrderDetail from "./pages/OrderDetail";
import MyOrders from "./pages/MyOrders";
import MyOrderDetail from "./pages/MyOrderDetail";
import AdminMembers from "./pages/AdminMembers";
import AdminPlatforms from "./pages/AdminPlatforms";

import XiaoLiuRen from "./pages/XiaoLiuRen";
import ForceChangePassword from "./pages/ForceChangePassword";
import Numerology from "./pages/Numerology";
import SalesChart from "./pages/SalesChart";
import UnitCheck from "./pages/UnitCheck";
import ReferralProgram from "./pages/ReferralProgram";
import AdminReferrals from "./pages/AdminReferrals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Set status bar to dark content (black icons) on native platforms
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <AuthProvider>
      <TooltipProvider>
        <NotificationModalProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <BackButtonHandler />
          <DeepLinkHandler />
          <Routes>
            <Route path="/" element={<Login />} />
            {/* <Route path="/wuxing-sales" element={<WuxingMarketing />} /> */}
            <Route path="/terms" element={<Terms />} />
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/force-change-password"
              element={
                <ProtectedRoute allowDesktop>
                  <ForceChangePassword />
                </ProtectedRoute>
              }
            />
            <Route path="/create-account" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowDesktop>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/new"
              element={
                <ProtectedRoute>
                  <ClientEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:id/edit"
              element={
                <ProtectedRoute>
                  <ClientEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/energy"
              element={
                <ProtectedRoute>
                  <Energy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/xiao-liu-ren"
              element={
                <ProtectedRoute>
                  <XiaoLiuRen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/realtime"
              element={
                <ProtectedRoute>
                  <Realtime />
                </ProtectedRoute>
              }
            />
            <Route
              path="/realtime/history"
              element={
                <ProtectedRoute>
                  <RealtimeHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-chart"
              element={
                <ProtectedRoute>
                  <SalesChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/destiny"
              element={
                <ProtectedRoute>
                  <Destiny />
                </ProtectedRoute>
              }
            />
            <Route
              path="/destiny/history"
              element={
                <ProtectedRoute>
                  <DestinyHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/destiny/report"
              element={
                <ProtectedRoute>
                  <DestinyReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowDesktop>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowDesktop>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/history"
              element={
                <ProtectedRoute>
                  <ChatHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricing"
              element={
                <ProtectedRoute>
                  <Pricing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branch-relations"
              element={
                <ProtectedRoute>
                  <BranchRelations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bazi-encyclopedia"
              element={
                <ProtectedRoute>
                  <BaziEncyclopedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/energy-encyclopedia"
              element={
                <ProtectedRoute>
                  <EnergyEncyclopedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qimen-encyclopedia"
              element={
                <ProtectedRoute>
                  <QimenEncyclopedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/liuyao-encyclopedia"
              element={
                <ProtectedRoute>
                  <LiuYaoEncyclopedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sihai-encyclopedia"
              element={
                <ProtectedRoute>
                  <SiHaiEncyclopedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/synastry"
              element={
                <ProtectedRoute allowDesktop>
                  <Synastry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/synastry/history"
              element={
                <ProtectedRoute allowDesktop>
                  <SynastryHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/energy/history"
              element={
                <ProtectedRoute>
                  <EnergyHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wealth-encyclopedia"
              element={
                <ProtectedRoute>
                  <WealthEncyclopedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/spending-encyclopedia"
              element={
                <ProtectedRoute>
                  <SpendingEncyclopedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/speech-encyclopedia"
              element={
                <ProtectedRoute>
                  <SpeechEncyclopedia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flying-stars"
              element={
                <ProtectedRoute>
                  <FlyingStars />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/store" element={<Store />} />
            <Route path="/store/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} /> */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowDesktop>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowDesktop>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowDesktop>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute allowDesktop>
                  <ProductEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <ProtectedRoute allowDesktop>
                  <ProductEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <ProtectedRoute allowDesktop>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowDesktop>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute allowDesktop>
                  <MyOrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedRoute allowDesktop>
                  <AdminMembers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/platforms"
              element={
                <ProtectedRoute allowDesktop>
                  <AdminPlatforms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referral-program"
              element={
                <ProtectedRoute allowDesktop>
                  <ReferralProgram />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/referrals"
              element={
                <ProtectedRoute allowDesktop>
                  <AdminReferrals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/numerology"
              element={
                <ProtectedRoute>
                  <Numerology />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unit-check"
              element={
                <ProtectedRoute>
                  <UnitCheck />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNavBar />
        </BrowserRouter>
        </NotificationModalProvider>
      </TooltipProvider>
    </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
