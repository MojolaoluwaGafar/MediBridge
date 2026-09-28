import { Schema, model } from "mongoose";

const departmentSchema = new Schema(
  {
    field: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    availableSpecialist: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      required: true,
    },
    iconBgColor: String,
    iconColor: String,

    details: {
      overview: {
        type: String,
        required: true,
      },
      services: {
        type: [String],
        default: [],
      },
      image: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

export default model("Department", departmentSchema);