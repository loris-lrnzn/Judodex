import { createContext, useContext } from 'react'
import { routePath, type Route } from '../hooks/useRoute'

const NavContext = createContext<(r: Route) => void>(() => {})
export const NavProvider = NavContext.Provider
export const useNavigate = () => useContext(NavContext)

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Route }

/**
 * Lien de navigation interne. C'est une vraie ancre : on peut la copier,
 * l'ouvrir dans un nouvel onglet ou la partager. Le clic simple reste géré
 * côté application, sans rechargement.
 */
export function Link({ to, onClick, ...rest }: Props) {
  const navigate = useNavigate()
  return (
    <a
      {...rest}
      href={routePath(to)}
      onClick={(e) => {
        onClick?.(e)
        // On laisse le navigateur faire son travail pour les clics modifiés.
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        navigate(to)
      }}
    />
  )
}
