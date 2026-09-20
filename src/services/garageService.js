import api from "./api";

const garageService = {
  async getAll() {
    const response = await api.get("/garages");
    return response.data.garages;
  },

  async create(name) {
    const response = await api.post("/garages", {
      name: name.trim(),
    });

    return response.data;
  },
};

export default garageService;