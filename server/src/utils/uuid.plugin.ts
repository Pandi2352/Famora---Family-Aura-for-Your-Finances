import { Schema } from 'mongoose';
import { generateUUID } from './uuid';

/**
 * Mongoose plugin that replaces ObjectId _id with UUID string.
 * Apply globally or per-schema.
 *
 * Usage (global):  mongoose.plugin(uuidPlugin);
 * Usage (schema):  schema.plugin(uuidPlugin);
 */
export function uuidPlugin(schema: Schema): void {
  schema.add({
    _id: { type: String, default: generateUUID },
  });

  // Disable auto ObjectId for _id
  schema.set('id', false);
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  });
  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  });
}
