<script lang="ts">
  import { page } from "$app/stores";
  import { auth, firestore } from "$lib/firebase";
  import { DateTime } from "luxon";
  import {
    eventToName,
    eventToKey,
    timeStringToMilliseconds,
    timeToStandard,
    type Event,
  } from "$lib/event";
  import { onMount } from "svelte";
  import { Doc, Collection, userStore, docStore, collectionStore } from "sveltefire";
  import { collection, getDocs, updateDoc, addDoc, doc } from "firebase/firestore";
  import type { WithID, Registrant } from "$lib/types";

  const id = $page.params.id;

  const user = userStore(auth);
  const userData = docStore(firestore, `users/${$user?.uid}`);
  const events = collectionStore<WithID<Event>>(firestore, `meets/${id}/events`);
  const registrants = collectionStore<WithID<Registrant>>(firestore, `meets/${id}/registrations`);
  const meet = docStore(firestore, `meets/${id}`);

  let selfRegistrant: WithID<Registrant> | null = null;

  $: if ($userData?.role === "swimmer") {
    selfRegistrant = $registrants.filter((r) => r.user === $user?.uid)[0];
  }

  let qrcode: HTMLDivElement;

  $: if (qrcode)
    new QRCode(qrcode, {
      text: `http://localhost:5173/meets/${id}/signup`,
      colorLight:
        "oklch(" +
        getComputedStyle(document.querySelector(":root")!).getPropertyValue("--b1") +
        ")",
      colorDark:
        "oklch(" +
        getComputedStyle(document.querySelector(":root")!).getPropertyValue("--bc") +
        ")",
    });

  let link = `${id}`;

  const copy = () => {
    navigator.clipboard.writeText(`http://localhost:5173/meets/${id}/signup`);

    link = "Link copied!";

    setTimeout(() => {
      link = `${id}`;
    }, 700);
  };

  const times: Record<string, Record<string, string>> = {};

  const submitTimes = async () => {
    const registrations = await getDocs(collection(firestore, `meets/${id}/registrations`));

    for (const registration of registrations.docs) {
      await updateDoc(registration.ref, {
        times: times[registration.data().user],
      });
    }

    for (const participant in times) {
      await addDoc(collection(firestore, `users/${participant}/history`), {
        meet: id,
        timestamp: new Date(),
        times: times[participant],
      });
    }

    await updateDoc(doc(firestore, `meets/${id}`), {
      timesSubmitted: true,
    });
  };
</script>

{#if $meet === null}
  <div class="mx-auto flex max-w-screen-lg flex-col items-center">
    <h1 class="text-4xl font-bold">Meet not found</h1>
    <p class="mt-4">It seems the meet you were looking for doesn't exist. Maybe it was deleted?</p>

    <a href="/meets" class="btn btn-primary mt-8">Back to meets</a>
  </div>
{:else if $meet !== undefined}
  <div class="mx-auto max-w-screen-lg">
    <h1 class="text-4xl font-bold">
      Meet at {$meet.location} on {DateTime.fromJSDate($meet.date.toDate())
        .setLocale("en-US")
        .toLocaleString(DateTime.DATETIME_MED)}
    </h1>

    {#if $userData.role === "coach"}
      <div class="mt-8 flex flex-col">
        <div bind:this={qrcode} class="mx-auto" />

        <button
          class="mx-auto mt-4 w-min text-nowrap rounded-2xl bg-blue-200 px-16 py-4 font-mono text-xl font-bold text-black"
          on:click={copy}>{link}</button
        >

        <p class="mt-6 text-center text-lg">
          Share this QR code with your swimmers to allow them to sign up for the meet.
        </p>

        <p class="mt-2 text-center">(psst: you can click on the ID to copy a link!)</p>

        <h2 class="mt-8 text-2xl font-bold">Events:</h2>

        <form on:submit|preventDefault={submitTimes} class="flex flex-col">
          {#each $events as event}
            <h3
              class="mt-2 {$registrants.filter((r) => r.events.includes(eventToKey(event))).length
                ? 'mt-4 font-bold'
                : 'text-gray-500'}"
            >
              {eventToName(event)}
            </h3>

            <ul class="ml-4 list-inside list-disc">
              {#each $registrants.filter((r) => r.events.includes(eventToKey(event))) as registrant}
                <Doc ref="users/{registrant.user}" let:data={registrantData}>
                  {(times[registrant.user] = times[registrant.user] ?? {}) ? "" : ""}
                  <li>
                    {registrantData.name}
                    {#if !$meet.timesSubmitted}
                      <input
                        class="input input-sm input-bordered ml-2 w-24"
                        bind:value={times[registrant.user][eventToKey(event)]}
                        required
                      />
                      <br />
                      <p class="text-error">
                        {#if times[registrant.user][eventToKey(event)] && !/^(\d{0,2}:)?([0-5]?\d)\.(\d{2})$/.test(times[registrant.user][eventToKey(event)])}
                          Please format the time in either 0.00 or 0:00.00.
                        {/if}
                      </p>
                    {:else}
                      - {registrant.times[eventToKey(event)]} ({timeToStandard(
                        event,
                        timeStringToMilliseconds(registrant.times[eventToKey(event)]),
                      )})
                    {/if}
                  </li>
                </Doc>
              {/each}
            </ul>
          {/each}

          {#if !$meet.timesSubmitted}
            <button class="btn btn-primary mt-4" type="submit">Submit times</button>
          {/if}
        </form>
      </div>
    {:else}
      <h2 class="mt-8 text-2xl font-bold">Your events:</h2>

      <div class="mt-4">
        {#if $registrants.filter((r) => r.user === $user?.uid)[0]?.events}
          {#if !$meet.timesSubmitted}
            {#each $events.filter((e) => selfRegistrant?.events.includes(eventToKey(e))) as event}
              <li>
                {eventToName(event)}
              </li>
            {/each}
          {:else}
            <div class="grid grid-cols-2">
              {#each $events.filter((e) => selfRegistrant?.events.includes(eventToKey(e))) as event}
              <div class="card w-96 bg-base-100 shadow-xl">
                <div class="card-body">
                  <h2 class="card-title">{eventToName(event)}</h2>
                  <p class="text-center font-bold text-6xl text-secondary">{selfRegistrant?.times[eventToKey(event)]}</p>
                  <p class="text-center">Meets {timeToStandard(event, timeStringToMilliseconds(selfRegistrant?.times[eventToKey(event)] ?? "0.00"))} standard</p>
                </div>
              </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{/if}
