import useUserContext from "~hooks/useUserContext";
import useThemeContext from "~hooks/useThemeContext";

export default function SettingsPage() {
  const { isAuthenticated, logout } = useUserContext();
  const { toggleTheme } = useThemeContext();

  return (
    <div>
      <button onClick={toggleTheme}>Toggle Theme</button>

      {isAuthenticated && <button onClick={logout}>Logout</button>}
    </div>
  );
}
