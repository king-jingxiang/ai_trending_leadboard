import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { GrowthTimeMachine } from './pages/GrowthTimeMachine';
import { CategoryExplorer } from './pages/CategoryExplorer';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/growth" element={<GrowthTimeMachine />} />
          <Route path="/categories" element={<CategoryExplorer />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
