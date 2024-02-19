import type { DocumentReference, Timestamp } from "firebase/firestore";

export type WithID<T> = T & { id: string };

export type Registrant = {
  events: string[];
  times: Record<string, string>;
  user: string;
};

export type UserData = {
  name: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: Date;
  team: DocumentReference;
  role: "swimmer" | "coach";
};

export type InfoboardPost = {
  title: string;
  content: string;
  postedAt: Timestamp;
  postedBy: DocumentReference;
};
