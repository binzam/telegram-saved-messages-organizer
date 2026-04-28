import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/auth-hooks";
import { queryClient } from "./lib/query-client";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import TaskPage from "./pages/TaskPage";
import ProtectedLayout from "./layouts/ProtectedLayout";

function App() {
  const { data: authed } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authed ? (
            <Navigate to="/" replace />
          ) : (
            <Login
              onAuthed={() =>
                queryClient.invalidateQueries({ queryKey: ["auth"] })
              }
            />
          )
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks/:messageId" element={<TaskPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
