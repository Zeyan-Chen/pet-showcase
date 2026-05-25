import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    includeInAllListing: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const CategoryModel = models.Category ?? model("Category", categorySchema);
