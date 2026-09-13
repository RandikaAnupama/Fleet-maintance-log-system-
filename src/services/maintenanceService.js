import api from "./api";

const maintenanceService = {
  async getAll() {
    const response = await api.get("/maintenance");
    return response.data.maintenance;
  },

  async create(maintenance) {
    const response = await api.post("/maintenance", maintenance);
    return response.data;
  },

  async update(id, maintenance) {
    const response = await api.put(`/maintenance/${id}`, maintenance);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },
};

export default maintenanceService;