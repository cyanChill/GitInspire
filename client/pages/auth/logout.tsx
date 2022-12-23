import useUserContext from "~hooks/useUserContext";

export default function Dummy() {
  const { logout } = useUserContext();

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
