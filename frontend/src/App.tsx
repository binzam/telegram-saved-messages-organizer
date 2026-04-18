import { useAuth } from "./hooks/auth-hooks";
import { queryClient } from "./lib/query-client";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
  const { data: authed, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Checking authentication...
      </div>
    );
  }

  return authed ? (
    <Dashboard />
  ) : (
    <Login
      onAuthed={() => queryClient.invalidateQueries({ queryKey: ["auth"] })}
    />
  );
}

export default App;
