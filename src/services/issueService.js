import api from "./api";

const issueService = {
  async getAll() {
    const response = await api.get("/issues");
    return response.data.issues;
  },

  async create(data) {
    const response = await api.post("/issues", data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.put(`/issues/${id}/status`, {
      status,
    });
    return response.data;
  },
};

export default issueService;