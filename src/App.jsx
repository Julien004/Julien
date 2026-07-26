import { HashRouter, Routes, Route } from 'react-router-dom'
import { TrackerProvider } from './lib/store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Nutrition from './pages/Nutrition'
import MealPlans from './pages/MealPlans'
import Workouts from './pages/Workouts'

function App() {
  return (
    <TrackerProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="meal-plans" element={<MealPlans />} />
            <Route path="workouts" element={<Workouts />} />
          </Route>
        </Routes>
      </HashRouter>
    </TrackerProvider>
  )
}

export default App
