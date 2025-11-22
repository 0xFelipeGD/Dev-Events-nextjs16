import Link from "next/link";
import Image from "next/image";

const EventCard = ({ slug, image, title, location, date, time }) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      <Image
        src={image}
        alt={title}
        width={410}
        height={300}
        className="poster"
      />
      <div className="flex flex-row gap-2">
        <Image
          src="/icons/pin.svg"
          alt="Location Icon"
          width={14}
          height={14}
        />
        <p>{location}</p>
      </div>
      <p className="title">{title}</p>

      <div className="flex flex-row gap-2">
        <p className="flex flex-row gap-2">
          <Image
            src="/icons/calendar.svg"
            alt="Calendar Icon"
            width={14}
            height={14}
          />
          {date}
        </p>
        <p> | </p>
        <p className="flex flex-row gap-2">
          <Image
            src="/icons/clock.svg"
            alt="Clock Icon"
            width={14}
            height={14}
          />
          {time}
        </p>
      </div>
    </Link>
  );
};

export default EventCard;
