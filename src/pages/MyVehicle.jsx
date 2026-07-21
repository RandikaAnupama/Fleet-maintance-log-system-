import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

export default function MyVehicle() {
  return <>
    <PageHeader title="My Assigned Vehicle" subtitle="Read-only details for the vehicle assigned to the logged-in user." />
    <div className="card">
      <div className="card-body">
        <div className="row g-4">
          <div className="col-md-4"><div className="vehicle-hero"><i className="bi bi-truck-front-fill"></i></div></div>
          <div className="col-md-8">
            <h3>Toyota Hilux</h3>
            <p className="text-muted">CAB-1234</p>
            <div className="row g-3">
              <div className="col-sm-6"><strong>Year</strong><div>2021</div></div>
              <div className="col-sm-6"><strong>Mileage</strong><div>84,500 km</div></div>
              <div className="col-sm-6"><strong>Status</strong><div><StatusBadge value="ACTIVE" /></div></div>
              <div className="col-sm-6"><strong>Next Service</strong><div>15 Aug 2026</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>;
}
