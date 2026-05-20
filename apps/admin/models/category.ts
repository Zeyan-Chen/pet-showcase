import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true }
  },
  {
    timestamps: true
  }
);

export const CategoryModel = models.Category ?? model("Category", categorySchema);
