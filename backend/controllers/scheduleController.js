const scheduleModel = require("../models/scheduleModel");
const vehicleModel = require("../models/vehicleModel");
const garageModel = require("../models/garageModel");

const {
  validId,
  validateSchedule,
  validateCompletion,
} = require("../utils/scheduleValidation");

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const handleError = (res, error, message) => {
  if ([400, 404, 409].includes(error.status)) {
    return fail(res, error.status, error.message);
  }

  if (
    error.code === "ER_NO_REFERENCED_ROW_2" ||
    error.code === "ER_ROW_IS_REFERENCED_2"
  ) {
    return fail(
      res,
      409,
      "Related records changed or prevent this action. Refresh and try again."
    );
  }

  console.error(message, error);
  return fail(res, 500, message);
};

const prepareSchedule = async (body, existing = null) => {
  if (
    body.status !== undefined ||
    body.maintenance_id !== undefined
  ) {
    return {
      error: "Use the Complete or Cancel action to change schedule status.",
    };
  }

  const fields = [
    "vehicle_id",
    "garage_id",
    "service_type",
    "due_date",
    "estimated_cost",
  ];

  const schedule = {};

  for (const field of fields) {
    schedule[field] =
      body[field] === undefined ? existing?.[field] : body[field];
  }

  const validationError = validateSchedule(schedule);

  if (validationError) {
    return { error: validationError };
  }

  const vehicle = await vehicleModel.getVehicleById(
    schedule.vehicle_id
  );

  if (!vehicle) {
    return { error: "Selected vehicle does not exist." };
  }

  const keepingExistingVehicle =
    existing &&
    String(existing.vehicle_id) === String(schedule.vehicle_id);

  if (vehicle.status === "INACTIVE" && !keepingExistingVehicle) {
    return { error: "Select an active vehicle." };
  }

  const garage = await garageModel.getGarageById(schedule.garage_id);

  if (!garage) {
    return { error: "Selected garage does not exist." };
  }

  const keepingExistingGarage =
    existing &&
    String(existing.garage_id) === String(schedule.garage_id);

  if (garage.status !== "ACTIVE" && !keepingExistingGarage) {
    return { error: "Select an active garage." };
  }

  return {
    schedule: {
      vehicle_id: Number(schedule.vehicle_id),
      garage_id: Number(schedule.garage_id),
      service_type: schedule.service_type.trim(),
      due_date: schedule.due_date,
      estimated_cost: Number(schedule.estimated_cost).toFixed(2),
    },
  };
};

const getAllSchedules = async (req, res) => {
  try {
    const schedules = await scheduleModel.getAllSchedules();

    return res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    return handleError(res, error, "Failed to get service schedules.");
  }
};

const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, "Invalid schedule ID.");
    }

    const schedule = await scheduleModel.getScheduleById(id);

    if (!schedule) {
      return fail(res, 404, "Service schedule not found.");
    }

    return res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    return handleError(res, error, "Failed to get service schedule.");
  }
};

const createSchedule = async (req, res) => {
  try {
    const result = await prepareSchedule(req.body || {});

    if (result.error) {
      return fail(res, 400, result.error);
    }

    const scheduleId = await scheduleModel.createSchedule(
      result.schedule
    );

    return res.status(201).json({
      success: true,
      message: "Service schedule created successfully.",
      scheduleId,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create service schedule.");
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, "Invalid schedule ID.");
    }

    const existing = await scheduleModel.getScheduleById(id);

    if (!existing) {
      return fail(res, 404, "Service schedule not found.");
    }

    if (
      ["COMPLETED", "CANCELLED"].includes(existing.status) ||
      existing.maintenance_id !== null
    ) {
      return fail(
        res,
        409,
        "Completed or cancelled schedules cannot be edited."
      );
    }

    const prepared = await prepareSchedule(req.body || {}, existing);

    if (prepared.error) {
      return fail(res, 400, prepared.error);
    }

    const result = await scheduleModel.updateSchedule(
      id,
      prepared.schedule
    );

    if (result.affectedRows === 0) {
      const current = await scheduleModel.getScheduleById(id);

      if (!current) {
        return fail(res, 404, "Service schedule not found.");
      }

      if (
        ["COMPLETED", "CANCELLED"].includes(current.status) ||
        current.maintenance_id !== null
      ) {
        return fail(
          res,
          409,
          "The schedule changed. Refresh and try again."
        );
      }

      const matches = Object.entries(prepared.schedule).every(
        ([key, value]) =>
          key === "estimated_cost"
            ? Number(current[key]) === Number(value)
            : String(current[key]) === String(value)
      );

      if (!matches) {
        return fail(
          res,
          409,
          "The update could not be confirmed. Refresh and try again."
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Service schedule updated successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to update service schedule.");
  }
};

const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, "Invalid schedule ID.");
    }

    const result = await scheduleModel.cancelSchedule(id);

    if (result.affectedRows === 0) {
      const schedule = await scheduleModel.getScheduleById(id);

      if (!schedule) {
        return fail(res, 404, "Service schedule not found.");
      }

      return fail(
        res,
        409,
        "This schedule is already completed, cancelled or linked to maintenance."
      );
    }

    return res.status(200).json({
      success: true,
      message: "Service schedule cancelled successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to cancel service schedule.");
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, "Invalid schedule ID.");
    }

    const result = await scheduleModel.deleteSchedule(id);

    if (result.affectedRows === 0) {
      const schedule = await scheduleModel.getScheduleById(id);

      if (!schedule) {
        return fail(res, 404, "Service schedule not found.");
      }

      return fail(
        res,
        409,
        "Completed schedules or schedules linked to maintenance cannot be deleted."
      );
    }

    return res.status(200).json({
      success: true,
      message: "Service schedule deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete service schedule.");
  }
};

const completeSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return fail(res, 400, "Invalid schedule ID.");
    }

    const body = req.body || {};
    const validationError = validateCompletion(body);

    if (validationError) {
      return fail(res, 400, validationError);
    }

    const maintenanceId = await scheduleModel.completeSchedule(id, {
      service_date: body.service_date,
      next_service_date: body.next_service_date || null,
      actual_cost: Number(body.actual_cost).toFixed(2),
      description: body.description?.trim() || null,
    });

    return res.status(200).json({
      success: true,
      message: "Service completed and maintenance record created.",
      maintenanceId,
    });
  } catch (error) {
    return handleError(res, error, "Failed to complete service schedule.");
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  cancelSchedule,
  deleteSchedule,
  completeSchedule,
};