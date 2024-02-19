<script lang="ts">
  import { goto } from "$app/navigation";
  import { eventToName, genderToName, keyToEvent } from "$lib/event";
  import { auth, firestore } from "$lib/firebase";
  import {
    addDoc,
    collection,
    updateDoc,
    type DocumentData,
    doc,
    getDoc,
  } from "firebase/firestore";
  import { DateTime } from "luxon";
  import { getContext } from "svelte";
  import type { Context } from "svelte-simple-modal";
  import { userStore } from "sveltefire";

  export let meet: DocumentData;
  export let id: string;
  export let birthdate: Date;
  export let gender: "boy" | "girl";
  export let chosenEvents: string[];

  const user = userStore(auth);

  const confirmations = {
    gender: false,
    birthdate: false,
    events: false,
    noOtherEvents: false,
    noConflictingMeets: false,
  };

  const { close } = getContext("simple-modal") as Context;

  const confirm = async () => {
    await addDoc(collection(firestore, `meets/${id}/registrations`), {
      user: $user?.uid,
      events: chosenEvents,
    });

    const userData = await getDoc(doc(firestore, `users/${$user?.uid}`)).then((doc) => doc.data()!);

    const registeredMeets = userData.registeredMeets ?? [];

    await updateDoc(doc(firestore, `users/${$user?.uid}`), {
      birthdate,
      gender,
      registeredMeets: [...registeredMeets, id],
    });

    close();

    goto(`/meets`);
  };
</script>

<div class="flex flex-col">
  <h2 class="text-2xl font-bold">Confirm your inputs</h2>

  <p>
    This is what you've selected for this meet. Please make sure everything is correct, as you can't
    change them after you submit!
  </p>

  <p class="mt-4 flex gap-x-1">
    <input
      type="checkbox"
      class="checkbox-primary checkbox"
      bind:checked={confirmations.birthdate}
    />
    Your birthdate is
    <span class="font-bold"
      >{DateTime.fromJSDate(birthdate)
        .setLocale("en-US")
        .setZone("UTC")
        .toLocaleString(DateTime.DATE_FULL)}</span
    >
  </p>

  <p class="mt-2">
    <input type="checkbox" class="checkbox-primary checkbox" bind:checked={confirmations.gender} />
    Your gender is <span class="font-bold">{{ boy: "Male", girl: "Female" }[gender]}</span>
  </p>

  <p class="mt-2">
    <input type="checkbox" class="checkbox-primary checkbox" bind:checked={confirmations.events} /> You've
    selected the following events:
  </p>

  <ul class="ml-4 list-inside list-disc">
    {#each chosenEvents as eventKey}
      <li>{eventToName(keyToEvent(eventKey))}</li>
    {/each}
  </ul>

  <p class="mt-2">
    <input
      type="checkbox"
      class="checkbox-primary checkbox"
      bind:checked={confirmations.noOtherEvents}
    />
    You do <span class="font-bold">not</span> want any other events
  </p>

  <p class="mt-2">
    <input
      type="checkbox"
      class="checkbox-primary checkbox"
      bind:checked={confirmations.noConflictingMeets}
    />
    You do <span class="font-bold">not</span> have any meets while this meet is in session, and preferably
    during the whole day
  </p>

  <button
    class="btn btn-primary mt-4"
    disabled={!Object.values(confirmations).every(Boolean)}
    on:click={confirm}>Confirm!</button
  >
</div>
