import api from "./api";

const authService = {
  async login(credentials) {
    const response = await api.post("/auth/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    const data = response.data;

    if (!data?.success || !data.token || !data.user) {
      throw new Error(data?.message || "Login failed. Please try again.");
    }

    return {
      ...data,
      user: {
        ...data.user,
        name: data.user.full_name,
      },
    };
  },
};

export default authService;