import { Link } from "react-router-dom";
export default function Unauthorized() {
  return <div className="center-page"><div><h1>403</h1><h3>Access denied</h3><p>Your role does not have permission to open this page.</p><Link className="btn btn-primary" to="/dashboard">Back to Dashboard</Link></div></div>;
}
