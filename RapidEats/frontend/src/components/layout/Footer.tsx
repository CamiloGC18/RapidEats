const Footer = () => {
  return (
    <footer className="bg-primary-black text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-primary-green">Rapid</span>Eats
            </h3>
            <p className="text-gray-400">
              Delivery de comida rápido y confiable. Tus platillos favoritos en minutos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/restaurants" className="hover:text-primary-green transition">
                  Restaurantes
                </a>
              </li>
              <li>
                <a href="/orders" className="hover:text-primary-green transition">
                  Mis Pedidos
                </a>
              </li>
              <li>
                <a href="/profile" className="hover:text-primary-green transition">
                  Mi Perfil
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@rapideats.com</li>
              <li>Teléfono: +57 300 123 4567</li>
              <li>Horario: 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} RapidEats. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
