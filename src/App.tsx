import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from "@/features/homepage/components/HomePage";
import { ChatInterface } from "@/features/chatbot/components/ChatInterface";
import { EnhancedChatInterface } from "@/features/chatbot/components/EnhancedChatInterface";
import { ThemeProvider } from "@/components/providers/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="g-traffic-heroes-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chatbot" element={<ChatInterface />} />
          <Route path="/enhanced-chat" element={<EnhancedChatInterface />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
