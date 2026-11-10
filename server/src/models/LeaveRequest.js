import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema({
  employeeName: { type: String, default: "Employee", trim: true },
  leaveType: { type: String, enum: ["Casual Leave", "Medical Leave"], required: true },
  days: { type: Number, required: true, min: 1 },
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Pending Approval", "Approved", "Rejected"], default: "Pending Approval" }
}, { timestamps: true });

export default mongoose.model("LeaveRequest", leaveRequestSchema);
