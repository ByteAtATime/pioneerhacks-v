import type { DocumentData } from "firebase/firestore";
import times from "../times.json";

export enum TimeStandard {
  AAAA = "AAAA",
  AAA = "AAA",
  AA = "AA",
  A = "A",
  BB = "BB",
  B = "B",
  NONE = "NONE",
}

export type Event = {
  gender: "boy" | "girl";
  age: AgeRange;
  poolSize: "SCY" | "LCM" | "SCM";
  length: number;
  stroke: "free" | "back" | "breast" | "fly" | "IM";
};

export type AgeRange = "10 & under" | "11-12" | "13-14" | "15-16" | "17-18";

// convert a time in ms to a time standard by finding the fastest standard that is slower than the time
export const timeToStandard = (event: Event, time: number): TimeStandard => {
  const standards = (
    times[event.gender][event.poolSize][event.age] as Record<
      string,
      {
        aaaa: number;
        aaa: number;
        aa: number;
        a: number;
        bb: number;
        b: number;
      }
    >
  )[eventToShortName(event)];

  // find the fastest standard that is slower than the time, where AAAA is the fastest and B is the slowest
  if (time < standards.aaaa) {
    return TimeStandard.AAAA;
  } else if (time < standards.aaa) {
    return TimeStandard.AAA;
  } else if (time < standards.aa) {
    return TimeStandard.AA;
  } else if (time < standards.a) {
    return TimeStandard.A;
  } else if (time < standards.bb) {
    return TimeStandard.BB;
  } else if (time < standards.b) {
    return TimeStandard.B;
  } else {
    return TimeStandard.NONE;
  }
};

export const ageToRange = (age: number): AgeRange => {
  if (age < 11) {
    return "10 & under";
  } else if (age < 13) {
    return "11-12";
  } else if (age < 15) {
    return "13-14";
  } else if (age < 17) {
    return "15-16";
  } else if (age < 19) {
    return "17-18";
  }

  throw new Error("Invalid age");
};

export const eventToShortName = (event: Event): string => {
  return `${event.length} ${poolSizeToUnit(event.poolSize)} ${event.stroke[0].toUpperCase() + event.stroke.slice(1)}`;
};

export const eventToKey = (event: Event): string =>
  `${event.gender}|${event.age}|${event.poolSize}|${event.length}|${event.stroke}`;

export const keyToEvent = (pbkey: string): Event => {
  const [gender, age, poolSize, length, stroke] = pbkey.split("|");

  return {
    gender,
    age,
    poolSize,
    length: parseInt(length),
    stroke,
  } as Event;
};

export const genderToName = (gender: "boy" | "girl") => {
  switch (gender) {
    case "boy":
      return "Boys";
    case "girl":
      return "Girls";
  }
};

export const eventToName = (event: Event): string =>
  `${genderToName(event.gender)} ${event.age} ${event.length} ${poolSizeToUnit(event.poolSize)} ${event.stroke[0].toUpperCase() + event.stroke.slice(1)}`;

export const poolSizeToUnit = (poolSize: "SCY" | "LCM" | "SCM"): string =>
  poolSize === "SCY" ? "Y" : "M";

export const formatTime = (time: number): string => {
  const totalSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((time % 1000) / 10);

  // Format the time components
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
  const hundredthsStr = hundredths < 10 ? `0${hundredths}` : `${hundredths}`;

  // Construct the formatted time string
  let formattedTime = `${minutesStr}:${secondsStr}.${hundredthsStr}`;

  // If the time is less than a minute, remove the leading "00:"
  if (minutes === 0) {
    formattedTime = formattedTime.substring(3);
  }

  return formattedTime;
};

export const eventSorter = (
  a: { event: Event; time: number },
  b: { event: Event; time: number },
) => {
  const standard1 = timeToStandard(a.event, a.time);
  const standard2 = timeToStandard(b.event, b.time);

  // Defining the hierarchy of TimeStandards
  const hierarchy = [
    TimeStandard.AAAA,
    TimeStandard.AAA,
    TimeStandard.AA,
    TimeStandard.A,
    TimeStandard.BB,
    TimeStandard.B,
    TimeStandard.NONE,
  ];

  const index1 = hierarchy.indexOf(standard1);
  const index2 = hierarchy.indexOf(standard2);

  if (index1 === index2) {
    return 0;
  } else if (index1 < index2) {
    return 1;
  } else {
    return -1;
  }
};

export const pbSorter = (a: DocumentData, b: DocumentData) => {
  const aEvent = keyToEvent(a.id);
  const bEvent = keyToEvent(b.id);

  return -eventSorter({ event: aEvent, time: a.time }, { event: bEvent, time: b.time });
};

export const formatStroke = (stroke: "free" | "back" | "breast" | "fly" | "IM") => {
  switch (stroke) {
    case "free":
      return "Freestyle";
    case "back":
      return "Backstroke";
    case "breast":
      return "Breaststroke";
    case "fly":
      return "Butterfly";
    case "IM":
      return "Individual Medley";
  }
};

export const birthdateToAge = (birthdate: Date): number => {
  const today = new Date();
  const birthdateYear = birthdate.getFullYear();
  const todayYear = today.getFullYear();
  const birthdateMonth = birthdate.getMonth();
  const todayMonth = today.getMonth();
  const birthdateDay = birthdate.getDate();
  const todayDay = today.getDate();

  let age = todayYear - birthdateYear;

  if (todayMonth < birthdateMonth || (todayMonth === birthdateMonth && todayDay < birthdateDay)) {
    age--;
  }

  return age;
};

export const findEventsForAge = (age: number, gender: "boy" | "girl", events: Event[]): Event[] => {
  try {
    const ageRange = ageToRange(age);
    return events.filter((event) => event.age === ageRange && event.gender === gender);
  } catch {
    return [];
  }
};

export function timeStringToMilliseconds(timeString: string) {
  // Split the string into its components
  const timeComponents = timeString.split(/[:\.]/);

  // Extract minutes, seconds, and milliseconds
  let minutes = 0;
  let seconds = 0;
  let milliseconds = 0;

  if (timeComponents.length >= 2) {
    seconds = parseInt(timeComponents[timeComponents.length - 2]); // Extract seconds
    milliseconds = parseInt(timeComponents[timeComponents.length - 1]); // Extract milliseconds
  }

  if (timeComponents.length >= 3) {
    minutes = parseInt(timeComponents[timeComponents.length - 3]); // Extract minutes
  }

  // Calculate total milliseconds
  const totalMilliseconds = minutes * 60 * 1000 + seconds * 1000 + milliseconds;

  return totalMilliseconds;
}
