import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SessionProvider } from "./contexts/SessionContext";
import Home from "./pages/Home";
import Interview from "./pages/Interview";

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
