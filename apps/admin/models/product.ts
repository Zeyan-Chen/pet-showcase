import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    imageUrls: {
      type: [String],
      required: false,
      default: []
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      required: true,
      default: "draft"
    },
    isSoldOut: {
      type: Boolean,
      required: true,
      default: false
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false
    },
    mainCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false
    },
    childCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const ProductModel = models.Product ?? model("Product", productSchema);
