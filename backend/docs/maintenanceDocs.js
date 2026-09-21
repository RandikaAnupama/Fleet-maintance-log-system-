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
  403: errorResponse("Administrator access required"),
  500: errorResponse("Server error"),
};

const conflictResponse = errorResponse(
  "Related records changed or prevent this action. Refresh and try again."
);

const fields = {
  vehicle_id: {
    type: "integer",
    minimum: 1,
    description: "ID of an existing vehicle.",
    example: 4,
  },
  service_type: {
    type: "string",
    minLength: 1,
    maxLength: 100,
    description: "Must not be blank. Leading and trailing spaces are removed.",
    example: "Oil Change",
  },
  description: {
    type: "string",
    nullable: true,
    description: "Optional. Maximum 65,535 UTF-8 bytes after trimming.",
    example: "Changed engine oil and oil filter.",
  },
  service_date: {
    type: "string",
    format: "date",
    description: "Valid date in YYYY-MM-DD format. Year must be at least 1000.",
    example: "2026-09-20",
  },
  next_service_date: {
    type: "string",
    nullable: true,
    description:
      "YYYY-MM-DD date, null or an empty string. " +
      "Must not be earlier than service_date. Null or empty string clears it.",
    example: "2026-12-20",
  },
  cost: {
    description:
      "Greater than zero, maximum 99999999.99, with at most two decimal places. " +
      "Accepts a number or a decimal string.",
    oneOf: [
      {
        type: "number",
        minimum: 0,
        exclusiveMinimum: true,
        maximum: 99999999.99,
        multipleOf: 0.01,
      },
      {
        type: "string",
        pattern: "^\\d+(\\.\\d{1,2})?$",
      },
    ],
    example: 15500,
  },
  status: {
    type: "string",
    enum: ["PENDING", "COMPLETED"],
    description: "Defaults to PENDING when creating a record.",
    example: "COMPLETED",
  },
};

const maintenanceSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 3 },
    ...fields,
    vehicle_number: {
      type: "string",
      example: "TEST-9978",
    },
    next_service_date: {
      type: "string",
      format: "date",
      nullable: true,
      example: "2026-12-20",
    },
    cost: {
      description: "MySQL decimal value, commonly returned as a string.",
      oneOf: [
        { type: "string", example: "15500.00" },
        { type: "number", example: 15500 },
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

module.exports = {
  "/maintenance": {
    get: {
      tags: ["Maintenance"],
      summary: "Get all maintenance records",
      description: "ADMIN only.",
      security,

      responses: {
        200: jsonResponse("Maintenance records", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            maintenance: {
              type: "array",
              items: maintenanceSchema,
            },
          },
        }),
        ...commonErrors,
      },
    },

    post: {
      tags: ["Maintenance"],
      summary: "Create a maintenance record",
      description:
        "ADMIN only. The selected vehicle must exist. Cost must be greater than zero.",
      security,

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "vehicle_id",
                "service_type",
                "service_date",
                "cost",
              ],
              properties: fields,
            },
            example: {
              vehicle_id: 4,
              service_type: "Oil Change",
              description: "Changed engine oil and oil filter.",
              service_date: "2026-09-20",
              next_service_date: "2026-12-20",
              cost: 15500,
              status: "COMPLETED",
            },
          },
        },
      },

      responses: {
        201: jsonResponse("Maintenance created", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Maintenance created successfully.",
            },
            maintenanceId: { type: "integer", example: 5 },
          },
        }),
        400: errorResponse(
          "Invalid maintenance details or selected vehicle does not exist"
        ),
        409: conflictResponse,
        ...commonErrors,
      },
    },
  },

  "/maintenance/{id}": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "Maintenance record ID",
        schema: {
          type: "integer",
          minimum: 1,
        },
      },
    ],

    get: {
      tags: ["Maintenance"],
      summary: "Get one maintenance record",
      description: "ADMIN only.",
      security,

      responses: {
        200: jsonResponse("Maintenance details", {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            maintenance: maintenanceSchema,
          },
        }),
        400: errorResponse("Invalid maintenance ID"),
        404: errorResponse("Maintenance record not found"),
        ...commonErrors,
      },
    },

    put: {
      tags: ["Maintenance"],
      summary: "Update a maintenance record",
      description:
        "ADMIN only. Omitted fields retain their existing values. " +
        "The resulting record must pass all maintenance validations.",
      security,

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: fields,
            },
            example: {
              description: "Updated service details.",
              cost: 16000,
            },
          },
        },
      },

      responses: {
        200: messageResponse("Maintenance updated successfully."),
        400: errorResponse("Invalid maintenance ID or details"),
        404: errorResponse("Maintenance record not found"),
        409: conflictResponse,
        ...commonErrors,
      },
    },

    delete: {
      tags: ["Maintenance"],
      summary: "Delete a maintenance record",
      description:
        "ADMIN only. Removes the record from the database. " +
        "A related service schedule can prevent deletion.",
      security,

      responses: {
        200: messageResponse("Maintenance deleted successfully."),
        400: errorResponse("Invalid maintenance ID"),
        404: errorResponse("Maintenance record not found"),
        409: conflictResponse,
        ...commonErrors,
      },
    },
  },
};