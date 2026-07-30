import api from "./api";

const USERS_STORAGE_KEY = "fleet_users";

const mockUsers = [
  {
    email: "admin@fleet.com",
    password: "admin123",
    user: {
      id: 1,
      name: "System Admin",
      email: "admin@fleet.com",
      role: "ADMIN",
      status: "ACTIVE",
    },
  },
  {
    email: "user@fleet.com",
    password: "user123",
    user: {
      id: 2,
      name: "Kamal Perera",
      email: "user@fleet.com",
      role: "USER",
      status: "ACTIVE",
    },
  },
];

function getRegisteredUsers() {
  try {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

    if (!savedUsers) {
      return [];
    }

    const parsedUsers = JSON.parse(savedUsers);

    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch (error) {
    console.error("Failed to read registered users:", error);
    return [];
  }
}

const authService = {
  async login(credentials) {
    const useMock =
      String(import.meta.env.VITE_USE_MOCK_AUTH).toLowerCase() !== "false";

    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password;

      const demoMatch = mockUsers.find(
        (item) =>
          item.email.toLowerCase() === email &&
          item.password === password
      );

      if (demoMatch) {
        return {
          token: `mock-${demoMatch.user.role.toLowerCase()}-token`,
          user: demoMatch.user,
        };
      }

      const registeredUsers = getRegisteredUsers();

      const registeredMatch = registeredUsers.find(
        (user) =>
          String(user.email || "").trim().toLowerCase() === email &&
          user.password === password
      );

      if (!registeredMatch) {
        throw new Error("Invalid email or password.");
      }

      if (
        String(registeredMatch.status || "ACTIVE").toUpperCase() !==
        "ACTIVE"
      ) {
        throw new Error(
          "Your account is inactive. Please contact the administrator."
        );
      }

      const user = {
        id: registeredMatch.id,
        name: registeredMatch.name,
        email: registeredMatch.email,
        role: registeredMatch.role || "USER",
        status: registeredMatch.status || "ACTIVE",
      };

      return {
        token: `mock-${user.role.toLowerCase()}-${user.id}-token`,
        user,
      };
    }

    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
};

export default authService;