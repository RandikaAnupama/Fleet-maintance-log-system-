import api from "./api";

const driverService = {
  async getAll() {
    const response = await api.get("/drivers");
    return response.data.drivers;
  },

  async create(data) {
    const response = await api.post("/drivers", data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/drivers/${id}`, data);
    return response.data;
  },

  async deactivate(id) {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },
};

export default driverService;