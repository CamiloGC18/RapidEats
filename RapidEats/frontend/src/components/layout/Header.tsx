import { Link } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Heart } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../store/slices/authSlice'

const Header = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { items } = useAppSelector((state) => state.cart)

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <header className="bg-primary-black text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-primary-green">Rapid</span>
              <span>Eats</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/restaurants" className="hover:text-primary-green transition">
              Restaurantes
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" className="hover:text-primary-green transition">
                  Mis Pedidos
                </Link>
                <Link to="/favorites" className="hover:text-primary-green transition flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Favoritos
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              to="/checkout"
              className="relative p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-green text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2 hover:text-primary-green transition">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                  <span className="hidden md:inline">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
