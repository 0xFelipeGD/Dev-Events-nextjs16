import { Schema, model, models, Document } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Slug is required"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Event overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Event image is required"],
    },
    venue: {
      type: String,
      required: [true, "Event venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    mode: {
      type: String,
      required: [true, "Event mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
    },
    audience: {
      type: String,
      required: [true, "Event audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Event agenda is required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Event organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Event tags are required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt
  }
);

// Pre-save hook: Generate slug, normalize date and time
EventSchema.pre("save", async function () {
  // Generate URL-friendly slug from title if title is modified
  if (this.isModified("title")) {
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    let slug = baseSlug;
    let counter = 1;
    // Check for existing slugs
    const EventModel = this.constructor;
    while (await EventModel.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      counter++;
    }
    this.slug = slug;
  }

  // Validate and normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified("date")) {
    // Validate date string is in YYYY-MM-DD format and is a valid date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(this.date)) {
      throw new Error("Invalid date format. Please provide date as YYYY-MM-DD.");
    }
    // Further check if the date is valid (e.g., not 2023-02-30)
    const [year, month, day] = this.date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      throw new Error("Invalid date. Please provide a real calendar date in YYYY-MM-DD format.");
    }
    // Store as-is (already in YYYY-MM-DD)
    this.date = this.date;
  }

  // Normalize time to HH:MM format (24-hour)
  if (this.isModified("time")) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(this.time)) {
      // Try to parse and normalize if not in correct format
      const timeParts = this.time.match(/(\d{1,2}):(\d{2})/);
      if (timeParts) {
        const hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          this.time = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
        } else {
          throw new Error("Invalid time format. Use HH:MM format (24-hour).");
        }
      } else {
        throw new Error("Invalid time format. Use HH:MM format (24-hour).");
      }
    }
  }
});

// Prevent model recompilation in development (Next.js hot reload)
const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
