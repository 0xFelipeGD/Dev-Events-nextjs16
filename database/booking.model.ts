import { Schema, model, models, Document, Types } from "mongoose";
import Event from "./event.model";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          // Basic email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt
  }
);

// Add a compound unique index to prevent duplicate bookings for the same event/email pair
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });
// Pre-save hook: Validate that referenced event exists
BookingSchema.pre("save", async function () {
  // Only validate eventId if it's modified or new document
  if (this.isModified("eventId")) {
    const eventExists = await Event.findById(this.eventId);

    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
  }
});

// Prevent model recompilation in development (Next.js hot reload)
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
