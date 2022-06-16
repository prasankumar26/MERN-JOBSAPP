import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Register, Error, Landing, ProtectedRoute } from './pages'

import { AddJob, AllJob, Profile, SharedLayout, Stats } from './pages/dashboard'

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <SharedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Stats />} />
            <Route path='all-jobs' element={<AllJob />}></Route>
            <Route path='add-job' element={<AddJob />}></Route>
            <Route path='profile' element={<Profile />}></Route>
          </Route>

          <Route path='/register' element={<Register />} />
          <Route path='/landing' element={<Landing />} />
          <Route path='*' element={<Error />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
