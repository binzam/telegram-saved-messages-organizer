import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth-hooks";
import { SocketProvider } from "../providers/SocketProvider";

const ProtectedLayout = () => {
  const { data: authed, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1621] text-[#8fa8ba]">
        Checking authentication...
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
};

export default ProtectedLayout;
