import api from "./api";

const scheduleService = {
  async getAll() {
    const response = await api.get("/schedules");
    return response.data.schedules;
  },

  async getById(id) {
    const response = await api.get(`/schedules/${id}`);
    return response.data.schedule;
  },

  async create(data) {
    const response = await api.post("/schedules", data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  async complete(id, data) {
    const response = await api.post(`/schedules/${id}/complete`, data);
    return response.data;
  },

  async cancel(id) {
    const response = await api.post(`/schedules/${id}/cancel`);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};

export default scheduleService;