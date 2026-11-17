import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeName: { type: String, default: "Employee", trim: true },
    leaveType: {
      type: String,
      enum: ["Casual Leave", "Medical Leave"],
      required: true,
    },
    fromDate: { type: Date },
    toDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value || !this.fromDate) return true;
          return value >= this.fromDate;
        },
        message: "To date cannot be earlier than From date.",
      },
    },
    days: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
    },
  },
  { timestamps: true },
);

export default mongoose.model("LeaveRequest", leaveRequestSchema);
