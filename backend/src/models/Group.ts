// src/models/Group.ts
import { Schema, model, Document } from "mongoose";

export interface IGroup extends Document {
  groupName: string; // <= 30 chars
  ownerId: string;
  ownerEmail: string;
  authProvider: 'google';
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    groupName: { type: String, required: true, maxlength: 30 },
    ownerId: { type: String, required: true, index: true },
    ownerEmail: { type: String, required: true, index: true },
    authProvider: { type: String, required: true, default: 'google' },
  },
  { timestamps: true }
);

GroupSchema.index({ ownerId: 1, groupName: 1 });

export const Group = model<IGroup>("Group", GroupSchema);
