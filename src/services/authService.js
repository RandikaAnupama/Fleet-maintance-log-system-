import api from "./api";

const mockUsers = [
  {
    email: "admin@fleet.com",
    password: "admin123",
    user: { id: 1, name: "System Admin", email: "admin@fleet.com", role: "ADMIN" }
  },
  {
    email: "user@fleet.com",
    password: "user123",
    user: { id: 2, name: "Kamal Perera", email: "user@fleet.com", role: "USER" }
  }
];

const authService = {
  async login(credentials) {
    const useMock = String(import.meta.env.VITE_USE_MOCK_AUTH).toLowerCase() !== "false";

    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const match = mockUsers.find(
        (item) =>
          item.email === credentials.email.trim().toLowerCase() &&
          item.password === credentials.password
      );
      if (!match) throw new Error("Invalid email or password.");
      return {
        token: `mock-${match.user.role.toLowerCase()}-token`,
        user: match.user
      };
    }

    const response = await api.post("/auth/login", credentials);
    return response.data;
  }
};

export default authService;
