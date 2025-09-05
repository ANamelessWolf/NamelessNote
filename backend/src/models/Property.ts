import { Schema, model, Document, Types } from "mongoose";

export interface IProperty extends Document {
  groupId: Types.ObjectId;
  propertyNameOriginal: string;
  propertyNameLower: string; // para unicidad case-insensitive
  propertyValueBase64: string; // HTML en base64
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    propertyNameOriginal: { type: String, required: true },
    propertyNameLower: { type: String, required: true, index: true },
    propertyValueBase64: { type: String, required: true },
  },
  { timestamps: true }
);

// Index de unicidad por grupo + nombre en lower
PropertySchema.index({ groupId: 1, propertyNameLower: 1 }, { unique: true });

export const Property = model<IProperty>("Property", PropertySchema);
