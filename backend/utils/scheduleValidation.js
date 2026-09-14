const validId = (value) =>
  /^[1-9]\d*$/.test(String(value)) &&
  Number.isSafeInteger(Number(value));

const validDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number(value.slice(0, 4)) < 1000
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const validCost = (value) =>
  ["string", "number"].includes(typeof value) &&
  /^\d+(\.\d{1,2})?$/.test(String(value).trim()) &&
  Number.isFinite(Number(value)) &&
  Number(value) > 0 &&
  Number(value) <= 99999999.99;

const validateSchedule = (schedule) => {
  if (!validId(schedule.vehicle_id)) {
    return "Select a valid vehicle.";
  }

  if (!validId(schedule.garage_id)) {
    return "Select a valid garage.";
  }

  if (
    typeof schedule.service_type !== "string" ||
    !schedule.service_type.trim() ||
    schedule.service_type.trim().length > 100
  ) {
    return "Service type is required and cannot exceed 100 characters.";
  }

  if (!validDate(schedule.due_date)) {
    return "Enter a valid scheduled date in YYYY-MM-DD format.";
  }

  if (!validCost(schedule.estimated_cost)) {
    return "Estimated cost must be greater than zero, with at most two decimal places, and no more than 99999999.99.";
  }

  return null;
};

const validateCompletion = (completion) => {
  if (!validDate(completion.service_date)) {
    return "Enter a valid completion date in YYYY-MM-DD format.";
  }

  if (!validCost(completion.actual_cost)) {
    return "Actual cost must be greater than zero, with at most two decimal places, and no more than 99999999.99.";
  }

  if (
    completion.description !== undefined &&
    completion.description !== null
  ) {
    if (typeof completion.description !== "string") {
      return "Description must be text.";
    }

    if (
      Buffer.byteLength(completion.description.trim(), "utf8") > 65535
    ) {
      return "Description is too long.";
    }
  }

  const nextDate = completion.next_service_date;

  if (nextDate !== undefined && nextDate !== null && nextDate !== "") {
    if (!validDate(nextDate)) {
      return "Enter a valid next service date in YYYY-MM-DD format.";
    }

    if (nextDate < completion.service_date) {
      return "Next service date cannot be earlier than completion date.";
    }
  }

  return null;
};

module.exports = {
  validId,
  validateSchedule,
  validateCompletion,
};