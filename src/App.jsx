import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { APIKeyProvider } from './context/APIKeyContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './components/Home/Home';
import BylawsBrowser from './components/BylawsBrowser/BylawsBrowser';
import PolicyAdvisor from './components/PolicyAdvisor/PolicyAdvisor';
import QuickReference from './components/QuickReference/QuickReference';
import AssessmentsHome from './components/Assessments/AssessmentsHome';
import VendorDEI from './components/Assessments/VendorDEI';
import DietaryEquity from './components/Assessments/DietaryEquity';
import FoodPurchasing from './components/Assessments/FoodPurchasing';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <APIKeyProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
              <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/bylaws" element={<BylawsBrowser />} />
                  <Route
                    path="/advisor"
                    element={
                      <PolicyAdvisor
                        messages={chatMessages}
                        setMessages={setChatMessages}
                      />
                    }
                  />
                  <Route path="/assessments" element={<AssessmentsHome />} />
                  <Route path="/assessments/vendor-dei" element={<VendorDEI />} />
                  <Route path="/assessments/dietary" element={<DietaryEquity />} />
                  <Route path="/assessments/food-purchasing" element={<FoodPurchasing />} />
                  <Route path="/quick-reference" element={<QuickReference />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </APIKeyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
