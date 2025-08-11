import Cookies from "js-cookie";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";

const PrivateLayout = () => {
  // let Auth =  import.meta.env.VITE_DEBUGGING === "TRUE"
  //     ? true
  //     : Cookies.get("access") || sessionStorage.getItem("access");

  // const navigate = useNavigate();

  // if (!Auth) return <>{navigate("/login")}</>;
  // return <Outlet />;
  const location = useLocation();
  
  return <>{Cookies.get("access") ? <Outlet /> : <Navigate to={`/login?next=${location.pathname}`} />}</>;
};

export default PrivateLayout;
