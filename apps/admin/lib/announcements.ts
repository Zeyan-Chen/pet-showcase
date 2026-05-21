import type { AnnouncementInput, AnnouncementRecord } from "@pet-showcase/shared";
import { Types } from "mongoose";
import { AnnouncementModel } from "../models/announcement";
import { connectToDatabase } from "./db";

type RawAnnouncement = {
  _id: Types.ObjectId | string;
  message: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function serializeAnnouncement(announcement: RawAnnouncement): AnnouncementRecord {
  return {
    _id: announcement._id.toString(),
    message: announcement.message,
    isActive: announcement.isActive,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: announcement.updatedAt.toISOString()
  };
}

export async function listAnnouncements() {
  await connectToDatabase();
  const announcements = await AnnouncementModel.find()
    .sort({ createdAt: -1 })
    .lean<RawAnnouncement[]>();
  return announcements.map(serializeAnnouncement);
}

export async function listActiveAnnouncements() {
  await connectToDatabase();
  const announcements = await AnnouncementModel.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean<RawAnnouncement[]>();
  return announcements.map(serializeAnnouncement);
}

export async function createAnnouncement(input: AnnouncementInput) {
  await connectToDatabase();
  const announcement = await AnnouncementModel.create({
    message: input.message.trim(),
    isActive: input.isActive
  });
  return serializeAnnouncement(announcement.toObject());
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectToDatabase();
  const announcement = await AnnouncementModel.findByIdAndUpdate(
    id,
    {
      message: input.message.trim(),
      isActive: input.isActive
    },
    { new: true }
  ).lean<RawAnnouncement | null>();

  return announcement ? serializeAnnouncement(announcement) : null;
}

export async function deleteAnnouncement(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    return false;
  }

  await connectToDatabase();
  const result = await AnnouncementModel.findByIdAndDelete(id);
  return Boolean(result);
}
