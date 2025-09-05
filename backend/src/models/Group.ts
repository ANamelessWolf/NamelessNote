// src/models/Group.ts
import { Schema, model, Document } from "mongoose";

export interface IGroup extends Document {
  groupName: string; // <= 30 chars
  owner?: string;    // email opcional
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    groupName: { type: String, required: true, maxlength: 30 },
    owner: { type: String },
  },
  { timestamps: true }
);

export const Group = model<IGroup>("Group", GroupSchema);
