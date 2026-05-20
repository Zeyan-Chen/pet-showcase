import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      required: true,
      default: "draft"
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const ProductModel = models.Product ?? model("Product", productSchema);
