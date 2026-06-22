import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ChatPage } from "@/pages/ChatPage";
import { DebugPage } from "@/pages/DebugPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ChatPage />} />
          <Route path="debug" element={<DebugPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
