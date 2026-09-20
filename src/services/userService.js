import api from "./api";

const userService = {
  async getAll() {
    const response = await api.get("/users");
    return response.data.users;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  },

  async updateRole(id, role) {
    const response = await api.put(`/users/${id}/role`, {
      role,
    });
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.put(`/users/${id}/status`, {
      status,
    });
    return response.data;
  },

  async assignVehicle(id, vehicleId) {
    const response = await api.put(`/users/${id}/vehicle`, {
      assigned_vehicle_id: vehicleId,
    });
    return response.data;
  },
};

export default userService;