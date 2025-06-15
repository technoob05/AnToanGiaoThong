import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from "@/features/homepage/components/HomePage";
import { ChatInterface } from "@/features/chatbot/components/ChatInterface";
import { TrafficAgentInterface } from "@/features/traffic-agent/components/TrafficAgentInterface";
import { TrafficExplainerInterface } from "@/features/traffic-explainer/components/TrafficExplainerInterface";
import { QuizGeneratorInterface } from "@/features/quiz-generator/components/QuizGeneratorInterface";
import { ThemeProvider } from "@/components/providers/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="g-traffic-heroes-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chatbot" element={<ChatInterface />} />
          <Route path="/traffic-agent" element={<TrafficAgentInterface />} />
          <Route path="/traffic-explainer" element={<TrafficExplainerInterface />} />
          <Route path="/quiz-generator" element={<QuizGeneratorInterface />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
