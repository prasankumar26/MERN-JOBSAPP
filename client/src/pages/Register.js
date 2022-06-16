import { useState, useEffect } from 'react'
import { Alert, FormRow, Logo } from '../components'
import Wrapper from '../assets/wrappers/RegisterPage'
import { useAppContext } from '../context/appContext'
import { useNavigate } from 'react-router-dom'

const initialState = {
  name: '',
  email: '',
  password: '',
  isMember: false,
}

const Register = () => {
  const navigate = useNavigate()
  // after register navigate useer to dashboard
  const [values, setVlues] = useState(initialState)

  // context
  const {
    isLoading,
    showAlert,
    disPlayAlert,
    // reg user
    registerUser,
    user,
    // login user
    loginUser,
  } = useAppContext()

  // global state and use navigate

  const handleChange = (e) => {
    setVlues({ ...values, [e.target.name]: e.target.value })
  }

  // toggle user is there then login otherwise reg
  const toggleMember = () => {
    setVlues({ ...values, isMember: !values.isMember })
  }

  // form submit
  const onSubmit = (e) => {
    e.preventDefault()
    const { name, email, password, isMember } = values
    if (!email || !password || (!isMember && !name)) {
      disPlayAlert()
      return
    }

    // isMember true login user / register user
    const currentUser = { name, email, password }
    if (isMember) {
      loginUser(currentUser)
    } else {
      registerUser(currentUser)
    }
  }

  // after register navigate useer to dashboard
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        navigate('/')
      }, 3000)
    }
  }, [user, navigate])

  return (
    <Wrapper className='full-page'>
      <form className='form' onSubmit={onSubmit}>
        <Logo />
        <h3>{values.isMember ? 'Login' : 'Register'}</h3>
        {showAlert && <Alert />}
        {/* name field */}
        {!values.isMember && (
          <FormRow
            type='text'
            name='name'
            value={values.name}
            handleChange={handleChange}
          />
        )}

        <FormRow
          type='email'
          name='email'
          value={values.email}
          handleChange={handleChange}
        />
        <FormRow
          type='password'
          name='password'
          value={values.password}
          handleChange={handleChange}
        />

        <p>
          {values.isMember ? 'Not a Member' : 'Already a Member'}
          <button type='button' onClick={toggleMember} className='member-btn'>
            {values.isMember ? 'Register' : 'Login'}
          </button>
        </p>

        <button type='submit' className='btn btn-block' disabled={isLoading}>
          submit
        </button>
      </form>
    </Wrapper>
  )
}
export default Register
