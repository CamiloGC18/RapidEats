import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/redux'
import { setCredentials } from '../../store/slices/authSlice'
import { toast } from 'react-toastify'

const AuthCallback = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        dispatch(setCredentials({ user, token }))
        toast.success(`¡Bienvenido, ${user.name}!`)
        navigate('/')
      } catch (error) {
        console.error('Error parsing auth data:', error)
        toast.error('Error al iniciar sesión')
        navigate('/login')
      }
    } else {
      toast.error('Error al iniciar sesión')
      navigate('/login')
    }
  }, [searchParams, dispatch, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-green mx-auto"></div>
        <p className="text-white mt-4">Iniciando sesión...</p>
      </div>
    </div>
  )
}

export default AuthCallback
