import { Link } from "react-router-dom";
export default function NotFound() {
  return <div className="center-page"><div><h1>404</h1><h3>Page not found</h3><Link className="btn btn-primary" to="/dashboard">Go to Dashboard</Link></div></div>;
}
