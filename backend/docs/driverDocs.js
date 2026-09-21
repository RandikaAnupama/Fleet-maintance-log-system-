const jsonResponse = (description, schema) => ({
  description,
  content: {
    "application/json": { schema },
  },
});

const errorResponse = (description) =>
  jsonResponse(description, {
    $ref: "#/components/schemas/ErrorResponse",
  });

const messageResponse = (message) =>
  jsonResponse(message, {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: message },
    },
  });

const security = [{ bearerAuth: [] }];

const commonErrors = {
  401: errorResponse("Missing, invalid, expired or inactive session"),
  403: errorResponse("Access forbidden"),
  500: errorResponse("Server error"),
};

const fields = {
  full_name: {
    type: "string",
    minLength: 1,
    maxLength: 100,
    description: "Trimmed name. Must not be blank.",
    example: "Test Driver",
  },
  license_number: {
    type: "string",
    minLength: 1,
    maxLength: 50,
    description: "Unique license number. Must not be blank.",
    example: "SWAGGER-D001",
  },
  phone: {
    type: "string",
    nullable: true,
    pattern: "^([0-9]{10})?$",
    description: "10 digits, an empty string or null.",
    example: "0771234567",
  },
  email: {
    type: "string",
    nullable: true,
    maxLength: 100,
    description: "Valid email address, an empty string or null.",
    example: "driver.test@example.com",
  },
  address: {
    type: "string",
    nullable: true,
    description: "Optional address. Maximum 65,535 UTF-8 bytes.",
    example: "Colombo",
  },
  status: {
    type: "string",
    enum: ["ACTIVE", "INACTIVE"],
    description: "Defaults to ACTIVE when creating a driver.",
    example: "ACTIVE",
  },
};

const driverSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 3 },
    ...fields,
    created_at: {
      type: "string",
      format: "date-time",
      nullable: true,
    },
    updated_at: {
      type: "string",
      format: "date-time",
      nullable: true,
    },
  },
};

module.exports = {
  "/drivers": {
    get: {
      tags: ["Drivers"],
      summary: "Get all drivers",
      description: "Available to authenticated users.",
      security,

      responses: {
        200: jsonResponse("Driver list", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            drivers: {
              type: "array",
              items: driverSchema,
            },
          },
        }),
        ...commonErrors,
      },
    },

    post: {
      tags: ["Drivers"],
      summary: "Create a driver",
      description:
        "ADMIN only. Full name and unique license number are required. Unknown fields are rejected.",
      security,

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["full_name", "license_number"],
              properties: fields,
            },
            example: {
              full_name: "Test Driver",
              license_number: "SWAGGER-D001",
              phone: "0771234567",
              email: "driver.test@example.com",
              address: "Colombo",
              status: "ACTIVE",
            },
          },
        },
      },

      responses: {
        201: jsonResponse("Driver created", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Driver created successfully.",
            },
            driverId: {
              type: "integer",
              example: 4,
            },
          },
        }),
        400: errorResponse("Invalid driver details or unknown field"),
        409: errorResponse("Driver license number already exists"),
        ...commonErrors,
      },
    },
  },

  "/drivers/{id}": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "Driver ID",
        schema: {
          type: "integer",
          minimum: 1,
        },
      },
    ],

    get: {
      tags: ["Drivers"],
      summary: "Get one driver",
      description: "Available to authenticated users.",
      security,

      responses: {
        200: jsonResponse("Driver details", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            driver: driverSchema,
          },
        }),
        400: errorResponse("Invalid driver ID"),
        404: errorResponse("Driver not found"),
        ...commonErrors,
      },
    },

    put: {
      tags: ["Drivers"],
      summary: "Update a driver",
      description:
        "ADMIN only. Omitted fields retain their existing values. " +
        "Send an empty string or null to clear phone, email or address. " +
        "Unknown fields are rejected.",
      security,

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              additionalProperties: false,
              properties: fields,
            },
            example: {
              phone: "0779876543",
              address: "Kandy",
            },
          },
        },
      },

      responses: {
        200: messageResponse("Driver updated successfully."),
        400: errorResponse("Invalid driver ID, details or unknown field"),
        404: errorResponse("Driver not found"),
        409: errorResponse("Driver license number already exists"),
        ...commonErrors,
      },
    },

    delete: {
      tags: ["Drivers"],
      summary: "Deactivate a driver",
      description:
        "ADMIN only. Changes status to INACTIVE. The database record is retained.",
      security,

      responses: {
        200: messageResponse("Driver deactivated successfully."),
        400: errorResponse("Invalid driver ID"),
        404: errorResponse("Driver not found"),
        ...commonErrors,
      },
    },
  },
};