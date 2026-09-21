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

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "Vehicle ID",
  schema: {
    type: "integer",
    minimum: 1,
  },
};

const vehicleFields = {
  registration_number: {
    type: "string",
    maxLength: 50,
    example: "SWAGGER-9001",
  },
  make: {
    type: "string",
    maxLength: 100,
    example: "Toyota",
  },
  model: {
    type: "string",
    maxLength: 100,
    example: "Hilux",
  },
  manufacture_year: {
    type: "integer",
    nullable: true,
    minimum: 1900,
    description: "Must not exceed the current year plus one.",
    example: 2022,
  },
  vehicle_type: {
    type: "string",
    nullable: true,
    maxLength: 50,
    example: "Pickup",
  },
  fuel_type: {
    type: "string",
    nullable: true,
    maxLength: 30,
    example: "Diesel",
  },
  mileage: {
    type: "number",
    minimum: 0,
    example: 15000,
  },
  status: {
    type: "string",
    enum: ["ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"],
    example: "ACTIVE",
  },
};

const vehicleSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 8 },
    ...vehicleFields,
    mileage: {
      description: "MySQL decimal value, commonly returned as a string.",
      oneOf: [
        { type: "string", example: "15000.00" },
        { type: "number", example: 15000 },
      ],
    },
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

const commonErrors = {
  401: errorResponse("Missing, invalid, expired or inactive session"),
  403: errorResponse("Access forbidden"),
  500: errorResponse("Server error"),
};

module.exports = {
  "/vehicles": {
    get: {
      tags: ["Vehicles"],
      summary: "Get all vehicles",
      description: "Available to authenticated users.",
      security,
      responses: {
        200: jsonResponse("Vehicle list", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            vehicles: {
              type: "array",
              items: vehicleSchema,
            },
          },
        }),
        ...commonErrors,
      },
    },

    post: {
      tags: ["Vehicles"],
      summary: "Create a vehicle",
      description: "ADMIN only. Registration number must be unique.",
      security,

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["registration_number", "make", "model"],
              properties: vehicleFields,
            },
            example: {
              registration_number: "SWAGGER-9001",
              make: "Toyota",
              model: "Hilux",
              manufacture_year: 2022,
              vehicle_type: "Pickup",
              fuel_type: "Diesel",
              mileage: 15000,
              status: "ACTIVE",
            },
          },
        },
      },

      responses: {
        201: jsonResponse("Vehicle created", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Vehicle created successfully.",
            },
            vehicleId: { type: "integer", example: 8 },
          },
        }),
        400: errorResponse(
          "Missing required fields, invalid year, negative mileage or duplicate registration"
        ),
        ...commonErrors,
      },
    },
  },

  "/vehicles/{id}": {
    parameters: [idParameter],

    get: {
      tags: ["Vehicles"],
      summary: "Get one vehicle",
      description: "Available to authenticated users.",
      security,
      responses: {
        200: jsonResponse("Vehicle details", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            vehicle: vehicleSchema,
          },
        }),
        404: errorResponse("Vehicle not found"),
        ...commonErrors,
      },
    },

    put: {
      tags: ["Vehicles"],
      summary: "Update a vehicle",
      description:
        "ADMIN only. Send the fields to change. Omitted fields retain their existing values.",
      security,

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: vehicleFields,
            },
            example: {
              mileage: 16500,
            },
          },
        },
      },

      responses: {
        200: messageResponse("Vehicle updated successfully."),
        400: errorResponse(
          "Invalid vehicle details or duplicate registration number"
        ),
        404: errorResponse("Vehicle not found"),
        ...commonErrors,
      },
    },

    delete: {
      tags: ["Vehicles"],
      summary: "Deactivate a vehicle",
      description:
        "ADMIN only. Changes the vehicle status to INACTIVE. The database record is retained.",
      security,
      responses: {
        200: messageResponse("Vehicle deactivated successfully."),
        404: errorResponse("Vehicle not found"),
        ...commonErrors,
      },
    },
  },
};