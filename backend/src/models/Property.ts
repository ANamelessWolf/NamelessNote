import { Schema, model, Document, Types } from "mongoose";

export interface IProperty extends Document {
  groupId: Types.ObjectId;
  ownerId: string;
  ownerEmail: string;
  authProvider: 'google';
  propertyNameOriginal: string;
  propertyNameLower: string; // para unicidad case-insensitive
  propertyValueEncrypted: string;
  iv: string;
  authTag: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    ownerEmail: { type: String, required: true, index: true },
    authProvider: { type: String, required: true, default: 'google' },
    propertyNameOriginal: { type: String, required: true },
    propertyNameLower: { type: String, required: true, index: true },
    propertyValueEncrypted: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
  },
  { timestamps: true }
);

// Index de unicidad por grupo + nombre en lower
PropertySchema.index({ ownerId: 1, groupId: 1, propertyNameLower: 1 }, { unique: true });

export const Property = model<IProperty>("Property", PropertySchema);
