import React, { memo } from "react";

const formatStatusLabel = (status) => {
  if (!status) return "";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const TrackingTimeline = ({
  steps = [],
  currentStatus = "",
  className = "",
}) => {
  const normalizedCurrent = currentStatus
    ? String(currentStatus).trim().toLowerCase()
    : "";

  const normalizedLabel = (status) =>
    status ? String(status).trim().toLowerCase() : "";

  return (
    <div className={`space-y-6 ${className}`}>
      {steps.map((s, idx) => {
        const stepStatus = normalizedLabel(s.status);
        let stepState = "pending";

        if (stepStatus === normalizedCurrent) {
          if (stepStatus === "delivered") {
            stepState = "completed";
          } else if (stepStatus === "cancelled") {
            stepState = "cancelled";
          } else {
            stepState = "active";
          }
        } else if (!normalizedCurrent) {
          stepState = idx === steps.length - 1 ? "active" : "completed";
        } else {
          const pastSteps = steps
            .slice(0, idx)
            .map((item) => normalizedLabel(item.status));

          if (pastSteps.includes(normalizedCurrent)) {
            stepState = "pending";
          } else {
            stepState = "completed";
          }
        }

        const stateClass =
          stepState === "completed"
            ? "bg-green-100 text-green-700 "
            : stepState === "active"
              ? "bg-emerald-100 text-emerald-700 animate-pulse "
              : stepState === "cancelled"
                ? "bg-red-100 text-red-700 "
                : "bg-gray-100 text-gray-400 ";

        const displayLabel = s.label || formatStatusLabel(s.status);
        const displayStatus =
          stepState === "completed"
            ? "Completed"
            : stepState === "active"
              ? "In progress"
              : stepState === "cancelled"
                ? "Cancelled"
                : "Pending";

        return (
          <div key={s.key || s.id || idx} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${stateClass}`.trim()}
              >
                {stepState === "completed" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{idx + 1}</span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-px h-6 ${stepState === "completed" ? "bg-green-200" : "bg-gray-200"} mt-1`}
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <h4
                  className={`text-sm font-semibold ${stepState === "completed" ? "text-green-700" : stepState === "active" ? "text-emerald-700" : "text-gray-600"}`}
                >
                  {displayLabel}
                </h4>
                <p className="text-xs text-gray-400">
                  {s.timestamp
                    ? new Date(s.timestamp).toLocaleString("en-IN")
                    : ""}
                </p>
              </div>
              <p
                className={`text-xs mt-1 ${stepState === "completed" ? "text-green-600" : stepState === "active" ? "text-emerald-700" : "text-gray-500"}`}
              >
                {displayStatus}
              </p>
              {s.notes ? (
                <p className="text-xs mt-1 text-gray-500">{s.notes}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(TrackingTimeline);
