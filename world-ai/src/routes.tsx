import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Login from "./pages/auth/login";
import Test from "./pages/test";
import Landing from "./pages/landing";
import Signup from "./pages/auth/signup";
import AdminLayout from "./pages/admin/adminLayout";
import UserTable from "./pages/admin/users/userTable";
import Auth from "./components/auth";
import ChatLayout from "./pages/user/chat/chatLayout";
import ForgotPassword from "./pages/auth/forgotPassword";
import TwoFactorAuth from "./pages/auth/twoFactorAuth";
import ResetPassword from "./pages/auth/resetPassword";
import Dashboard from "./pages/admin/dashboard/dashboard";
import SettingsLayout from "./pages/settings";
import ProfileSettings from "./pages/settings/profile/profile";
import ApiSettings from "./pages/admin/api/apiSettings";
import InitialChatScreen from "./pages/user/chat/initialChatScreen";
import NewChat from "./pages/user/chat/newChat";
import CreateUser from "./pages/admin/users/createUser";
import LLMTablePage from "./pages/admin/llm/llmTable";
import { CreateLLMPage } from "./pages/admin/llm/createLlm";
import PromptTablePage from "./pages/admin/prompt/promptTable";
import CreatePromptPage from "./pages/admin/prompt/createPrompt";
import PricingPage from "./pages/landing/pricing";
import InpaintPage from "./pages/user/inpaint/inpaint";
import PreferencesPage from "./pages/settings/preferences";
import UsageTablePage from "./pages/admin/usage/usageTable";
import ProductsPage from "./pages/products";
import UpgradePage from "./pages/upgrade";
import PaymentSuccessPage from "./pages/user/payments/success";
import PaymentFailurePage from "./pages/user/payments/failure";
import PlanTable from "./pages/admin/plans/planTable";
import AddPlan from "./pages/admin/plans/addPlan";
import Transaction from "./pages/admin/transaction/transaction";
import EditPlan from "./pages/admin/plans/editPlan";
import AdminPricingPage from "./pages/admin/pricing";
import CreatePricingPage from "./pages/admin/pricing/create-pricing";
import Error404 from "./pages/Error404";

const router = createBrowserRouter([
  {
    path: "/testing",
    element: <Test />,
  },
  {
    path: "/",
    element: (
      <Auth isAuth={false}>
        <Landing />
      </Auth>
    ),
  },
  {
    path: "/pricing",
    element: (
      <Auth isAuth={false}>
        <PricingPage />
      </Auth>
    ),
  },
  {
    path: "/login",
    element: (
      <Auth isAuth={false}>
        <Login />
      </Auth>
    ),
  },
  {
    path: "/signup",
    element: (
      <Auth isAuth={false}>
        <Signup />
      </Auth>
    ),
  },

  {
    path: "/forgot-password",
    element: (
      <Auth isAuth={false}>
        <ForgotPassword />
      </Auth>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Auth isAuth={false}>
        <ResetPassword />
      </Auth>
    ),
  },
  {
    path: "/2fa",
    element: (
      <Auth isAuth={true}>
        <TwoFactorAuth />
      </Auth>
    ),
  },

  {
    path: "/chat",
    element: (
      <Auth isAuth={true}>
        <ChatLayout />
      </Auth>
    ),
    children: [
      {
        path: "new",
        element: <NewChat />,
      },
      {
        path: ":id",
        element: <InitialChatScreen />,
      },
      {
        path: "inpaint",
        element: <InpaintPage />,
      },
    ],
  },
  {
    path: "/payment/success",
    element: <PaymentSuccessPage />,
  },
  {
    path: "/payment/failure",
    element: <PaymentFailurePage />,
  },
  {
    path: "/upgrade",
    element: (
      <Auth isAuth={true}>
        <UpgradePage />
      </Auth>
    ),
  },
  {
    path: "/products",
    element: (
      <Auth isAuth={true}>
        <ProductsPage />
      </Auth>
    ),
  },
  {
    path: "/settings",
    element: (
      <Auth isAuth={true}>
        <SettingsLayout />
      </Auth>
    ),
    children: [
      {
        path: "profile",
        element: <ProfileSettings />,
      },
      {
        path: "",
        element: <Navigate to="profile" replace />,
      },
      {
        path: "preferences",
        element: <PreferencesPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <Auth isAuth={true} isAdmin={true}>
        <AdminLayout />
      </Auth>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "pricing",
        element: <AdminPricingPage />,
      },
      {
        path: "pricing/create",
        element: <CreatePricingPage />,
      },
      {
        path: "transactions",
        element: <Transaction />,
      },
      {
        path: "add-user",
        element: <CreateUser />,
      },
      {
        path: "llm",
        element: <LLMTablePage />,
      },
      {
        path: "plans",
        element: <PlanTable />,
      },
      {
        path: "plans/edit/:id",
        element: <EditPlan />,
      },
      {
        path: "transaction",
        element: <Transaction />,
      },
      {
        path: "plans/add",
        element: <AddPlan />,
      },
      {
        path: "prompts",
        element: <PromptTablePage />,
      },
      {
        path: "add-prompt",
        element: <CreatePromptPage />,
      },
      {
        path: "usage",
        element: <UsageTablePage />,
      },
      {
        path: "add-llm",
        element: <CreateLLMPage />,
      },
      {
        path: "profile",
        element: <ProfileSettings />,
      },
      {
        path: "users",
        element: <UserTable />,
      },
      {
        path: "api",
        element: <ApiSettings />,
      },
      {
        path: "chats",
        element: <h1>chats</h1>,
      },
      {
        path: "",
        element: <Navigate to="dashboard" replace />,
      },
    ],
  },
  {
    path: "*",
    element: <Error404 />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
