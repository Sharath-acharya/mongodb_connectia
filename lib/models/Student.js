import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name:    { type: String, required: [true, "Name is required"] },
    email:   { type: String, required: [true, "Email is required"], unique: true },
    age:     { type: Number, min: 1, max: 100 },
    course:  { type: String, default: "" },
    phone:   { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
