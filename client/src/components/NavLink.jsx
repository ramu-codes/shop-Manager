import { NavLink as RouterNavLink } from "react-router-dom";

export default function NavLink({
  to,
  end,
  className = "",
  activeClassName = "",
  children,
}) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${className} ${isActive ? activeClassName : ""}`
      }
    >
      {children}
    </RouterNavLink>
  );
}