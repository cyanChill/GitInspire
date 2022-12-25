import useUserContext from "~hooks/useUserContext";
import useThemeContext from "~hooks/useThemeContext";
import Button from "~components/form/Button";


export default function SettingsPage() {
  const { isAuthenticated, logout } = useUserContext();
  const { toggleTheme } = useThemeContext();

  return (
    <div>
      <Button onClick={toggleTheme}>Toggle Theme</Button>

      {isAuthenticated && <Button onClick={logout}>Logout</Button>}
    </div>
  );
}
