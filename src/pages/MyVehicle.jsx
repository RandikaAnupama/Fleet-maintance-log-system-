import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

export default function MyVehicle() {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVehicle = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/my-vehicle");
      setVehicle(response.data.vehicle);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load your assigned vehicle."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicle();
  }, []);

  return (
    <>
      <PageHeader
        title="My Assigned Vehicle"
        subtitle="Details of the vehicle assigned to your account."
        action={
          <button
            className="btn btn-outline-secondary"
            disabled={loading}
            onClick={loadVehicle}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger">
          {error} Click Refresh to try again.
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="card-body">
            Loading assigned vehicle...
          </div>
        </div>
      ) : error ? null : !vehicle ? (
        <div className="alert alert-info">
          No vehicle assigned. Please contact the administrator.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="vehicle-hero">
                  <i className="bi bi-truck-front-fill"></i>
                </div>
              </div>

              <div className="col-md-8">
                <h3>
                  {vehicle.make} {vehicle.model}
                </h3>

                <p className="text-muted">
                  {vehicle.registration_number}
                </p>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <strong>Year</strong>
                    <div>
                      {vehicle.manufacture_year ?? "Not recorded"}
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <strong>Mileage</strong>
                    <div>
                      {vehicle.mileage == null
                        ? "Not recorded"
                        : `${Number(vehicle.mileage).toLocaleString()} km`}
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <strong>Vehicle Type</strong>
                    <div>
                      {vehicle.vehicle_type || "Not recorded"}
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <strong>Fuel Type</strong>
                    <div>
                      {vehicle.fuel_type || "Not recorded"}
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <strong>Status</strong>
                    <div>
                      <StatusBadge value={vehicle.status} />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <strong>Next Scheduled Service</strong>
                    <div>
                      {vehicle.next_service_date ||
                        "No pending schedule"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}