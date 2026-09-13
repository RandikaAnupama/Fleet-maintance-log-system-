import api from "./api";

const repairService = {
  async getAll() {
    const response = await api.get("/repairs");
    return response.data.repairs;
  },

  async create(repair) {
    const response = await api.post("/repairs", repair);
    return response.data;
  },

  async update(id, repair) {
    const response = await api.put(`/repairs/${id}`, repair);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/repairs/${id}`);
    return response.data;
  },
};

export default repairService;