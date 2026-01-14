import {Header} from "./Components/Pages/Main/Header";
import {Footer} from "./Components/Pages/Main/Footer";
import {Route, Routes, useLocation} from 'react-router-dom';
import {MiniToolsList} from "./Components/Pages/Main/MiniToolsList";
import {MiniToolDetail} from "./Components/Pages/Detail/MiniToolDetail";
import {SearchProvider} from "./context/SearchContext";
import {ToolsProvider} from "./context/ToolsContext";
import {GlobalSearchModal} from "./Components/Pages/Main/GlobalSearchModal";
import { Analytics } from '@vercel/analytics/react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
    defaultOptions: {
        queries:{
            staleTimeout: 60 * 1000,
        }
    }
})

function AppContent() {
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith('/app/');

  return (
    <>
        <QueryClientProvider client={queryClient}>
            <ToolsProvider>
                <ReactQueryDevtools />
                <Header/>
                <GlobalSearchModal/>
                <Routes>
                    <Route path="/" element={<MiniToolsList/>}/>
                    <Route path="/app/:appId" element={<MiniToolDetail/>}/>
                </Routes>
                {!isDetailPage && <Footer/>}
            </ToolsProvider>
        </QueryClientProvider>
    </>
  );
}

function App() {
  return (
    <SearchProvider>
            <AppContent />
            <Analytics />
    </SearchProvider>
  );
}

export default App;
