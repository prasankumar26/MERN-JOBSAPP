import React, { useReducer, useContext } from 'react'
import reducer from './reducer'
// axios
import axios from 'axios'

import {
  Display_ALERT,
  CLEAR_ALERT,
  //  register user
  REGISTER_USER_BEGIN,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_ERORR,
  //  login User
  LOGIN_USER_BEGIN,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERORR,
  // toggle sidebar
  TOGGLE_SIDEBAR,
  // logout User
  LOGOUT_USER,
  // update user
  UPDATE_USER_BEGIN,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  // add job state values handlechange
  HANDLE_CHANGE,
  // clear values
  CLEAR_VALUES,
  // clear job
  CREATE_JOB_BEGIN,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
  // get all jobs
  GET_JOBS_BEGIN,
  GET_JOBS_SUCCESS,
  // Set edit job id
  SET_EDIT_JOB,
  // delete job
  DELETE_JOB_BEGIN,
  // edit job
  EDIT_JOB_BEGIN,
  EDIT_JOB_SUCCESS,
  EDIT_JOB_ERROR,
  // stats
  SHOW_STATS_BEGIN,
  SHOW_STATS_SUCCESS,
  // clar search filters
  CLEAR_FILTERS,
  // change page
  CHANGE_PAGE,
} from './actions'

//  localStorage get Item
const user = localStorage.getItem('user')
const token = localStorage.getItem('token')
const userLocation = localStorage.getItem('location')

// initialstate
const initialState = {
  isLoading: false,
  showAlert: false,
  alertText: '',
  alertType: '',
  //  register user
  user: user ? JSON.parse(user) : null,
  token: token,
  userLocation: userLocation || '',
  // toggle sidebar
  showSidebar: false,
  // create Job
  isEditing: false,
  editJobId: '',
  company: '',
  position: '',
  jobLocation: userLocation || '',
  jobType: 'full-time',
  status: 'pending',
  jobTypeOptions: ['part-time', 'full-time', 'remote', 'internship'],
  statusOptions: ['interview', 'declined', 'pending'],
  // get all jobs
  jobs: [],
  totalJobs: 0,
  numOfPages: 1,
  page: 1,
  // stats
  stats: {},
  monthlyApplications: [],
  // search  func
  search: '',
  sort: 'latest',
  searchStatus: 'all',
  searchType: '',
  sortOptions: ['latest', 'oldest', 'a-z', 'z-a'],
}
// create context
const AppContext = React.createContext()

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // axios for update User mainly handling errors 401
  const authFetch = axios.create({
    baseURL: '/api/v1/',
  })

  // request interceptor
  authFetch.interceptors.request.use(
    (config) => {
      config.headers.common['Authorization'] = `Bearer ${state.token}`
      // test
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  // response interceptor
  authFetch.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // console.log(error.response)
      if (error.response.status === 401) {
        logoutUser()
      }
      return Promise.reject(error)
    }
  )

  // disPlayAlert
  const disPlayAlert = () => {
    dispatch({ type: Display_ALERT })
    clearAlert()
  }

  // clearAlert after 3 seconds
  const clearAlert = () => {
    setTimeout(() => {
      dispatch({ type: CLEAR_ALERT })
    }, 3000)
  }

  // add user to localstorage
  const addUserToLocalStorage = ({ user, token, location }) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    localStorage.setItem('location', location)
  }

  // remove user to lcal storage
  const removeUserFromLocalStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('location')
  }

  // register user
  const registerUser = async (currentUser) => {
    dispatch({ type: REGISTER_USER_BEGIN })
    try {
      const response = await axios.post('/api/v1/auth/register', currentUser)
      // console.log(response);
      const { location, token, user } = response.data
      dispatch({
        type: REGISTER_USER_SUCCESS,
        payload: { location, token, user },
      })
      // localstorage
      addUserToLocalStorage({
        location,
        token,
        user,
      })
    } catch (error) {
      console.log(error.response)
      dispatch({
        type: REGISTER_USER_ERORR,
        payload: { msg: error.response.data.msg },
      })
    }
    clearAlert()
  }

  // login user
  const loginUser = async (currentUser) => {
    dispatch({ type: LOGIN_USER_BEGIN })
    try {
      const { data } = await axios.post('/api/v1/auth/login', currentUser)
      const { location, token, user } = data
      dispatch({
        type: LOGIN_USER_SUCCESS,
        payload: { location, token, user },
      })
      // localstorage comming
      addUserToLocalStorage({
        location,
        token,
        user,
      })
    } catch (error) {
      // console.log(error.response);
      dispatch({
        type: LOGIN_USER_ERORR,
        payload: { msg: error.response.data.msg },
      })
    }
    clearAlert()
  }

  // logout user
  const logoutUser = () => {
    dispatch({ type: LOGOUT_USER })
    removeUserFromLocalStorage()
  }

  // toggle sidebar
  const toggleSidebar = () => {
    dispatch({ type: TOGGLE_SIDEBAR })
  }

  // update User
  const updateUser = async (currentUser) => {
    dispatch({ type: UPDATE_USER_BEGIN })
    try {
      const { data } = await authFetch.patch('/auth/updateUser', currentUser)
      const { location, token, user } = data
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: { location, token, user },
      })
      // localstorage comming
      addUserToLocalStorage({
        location,
        token,
        user,
      })
    } catch (error) {
      if (error.response.status !== 401) {
        dispatch({
          type: UPDATE_USER_ERROR,
          payload: { msg: error.response.data.msg },
        })
      }
    }
    clearAlert()
  }

  // add job state values handlechange
  const handleChange = ({ name, value }) => {
    dispatch({
      type: HANDLE_CHANGE,
      payload: { name, value },
    })
  }

  // clear values
  const clearValues = () => {
    dispatch({ type: CLEAR_VALUES })
  }

  // create Job
  const createJob = async () => {
    dispatch({
      type: CREATE_JOB_BEGIN,
    })
    try {
      const { company, position, jobLocation, jobType, status } = state
      await authFetch.post('/jobs', {
        company,
        position,
        jobLocation,
        jobType,
        status,
      })

      dispatch({
        type: CREATE_JOB_SUCCESS,
      })

      // clear values after adding Job
      dispatch({ type: CLEAR_VALUES })
    } catch (error) {
      if (error.response.status !== 401) return
      dispatch({
        type: CREATE_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      })
    }
    clearAlert()
  }

  // get all jobs
  const getJobs = async () => {
    // search functionality
    const { page, search, searchStatus, searchType, sort } = state

    let url = `/jobs?page=${page}&status=${searchStatus}&jobType=${searchType}&sort=${sort}`

    if (search) {
      url = url + `&search=${search}`
    }

    dispatch({ type: GET_JOBS_BEGIN })
    try {
      const response = await authFetch(url)
      const { data } = response
      const { jobs, totalJobs, numOfPages } = data
      dispatch({
        type: GET_JOBS_SUCCESS,
        payload: { jobs, totalJobs, numOfPages },
      })
    } catch (error) {
      console.log(error)
      logoutUser()
    }
    clearAlert()
  }

  // setedit job id
  const editJob = (id) => {
    dispatch({
      type: SET_EDIT_JOB,
      payload: { id },
    })
  }

  // delete job
  const deleteJob = async (jobId) => {
    dispatch({ type: DELETE_JOB_BEGIN })
    try {
      await authFetch.delete(`/jobs/${jobId}`)
      getJobs()
    } catch (error) {
      logoutUser()
    }
  }

  // edit single Job
  const editSingleJob = async () => {
    dispatch({ type: EDIT_JOB_BEGIN })

    try {
      const { position, company, jobLocation, jobType, status } = state
      await authFetch.patch(`/jobs/${state.editJobId}`, {
        company,
        position,
        jobLocation,
        jobType,
        status,
      })
      dispatch({ type: EDIT_JOB_SUCCESS })
      dispatch({ type: CLEAR_VALUES })
    } catch (error) {
      if (error.response.status === 401) return
      dispatch({
        type: EDIT_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      })
    }
    clearAlert()
  }

  // stats
  const showStats = async () => {
    dispatch({ type: SHOW_STATS_BEGIN })
    try {
      const response = await authFetch('/jobs/stats')
      const { data } = response
      // console.log(data)
      dispatch({
        type: SHOW_STATS_SUCCESS,
        payload: {
          stats: data.defaultStats,
          monthlyApplications: data.monthlyApplications,
        },
      })
    } catch (error) {
      console.log(error)
      logoutUser()
    }
    clearAlert()
  }

  // search
  const clearFilters = () => {
    dispatch({ type: CLEAR_FILTERS })
  }

  const changePage = (page) => {
    dispatch({ type: CHANGE_PAGE, payload: { page } })
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        disPlayAlert,
        clearAlert,
        // reg user
        registerUser,
        // login user
        loginUser,
        // toggle sidebar
        toggleSidebar,
        // logout user
        logoutUser,
        // update User
        updateUser,
        //add job handleChange
        handleChange,
        // clearvalues
        clearValues,
        // create job
        createJob,
        // getalljobs
        getJobs,
        // edit job id
        editJob,
        // delete job
        deleteJob,
        // edit single job
        editSingleJob,
        // stats
        showStats,
        // search
        clearFilters,
        // changePage
        changePage,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const useAppContext = () => {
  return useContext(AppContext)
}

export { AppProvider, initialState, useAppContext }
