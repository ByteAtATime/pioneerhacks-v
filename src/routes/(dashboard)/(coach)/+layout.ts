import { auth, firestore } from "$lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { LayoutLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutLoad = async () => {
  const user = auth.currentUser;

  if (!user) {
    return {};
  }

  const userData = await getDoc(doc(firestore, `users/${user.uid}`)).then((doc) => doc.data());

  if (!userData) {
    throw error(404, "User not found");
  }

  if (userData.role !== "coach") {
    throw error(403, "Forbidden");
  }

  return {};
};
