import { Schema, model, models } from "mongoose";

const announcementSchema = new Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 160 },
    isActive: { type: Boolean, required: true, default: true }
  },
  {
    timestamps: true
  }
);

export const AnnouncementModel =
  models.Announcement ?? model("Announcement", announcementSchema);
