<script lang="ts">
  import CreateEventModal from "$lib/components/CreateEventModal.svelte";
  import { getContext } from "svelte";
  import { genderToName, type Event, formatStroke, eventToName } from "$lib/event";
  import type { Context } from "svelte-simple-modal";
  import { addDoc, collection } from "firebase/firestore";
  import { auth, firestore } from "$lib/firebase";
  import { docStore, userStore } from "sveltefire";
  import MeetCreationSuccessModal from "$lib/components/MeetCreationSuccess.svelte";
  import { fly } from "svelte/transition";
  import { DateTime } from "luxon";

  const user = userStore(auth);
  const userData = docStore(firestore, `users/${$user?.uid}`);

  let step = 1;

  const { open, close } = getContext("simple-modal") as Context;

  let events: Event[] = [];

  const addEvent = (event: Event) => {
    events = [...events, event];
  };

  let capacity = 100;
  let location = "";
  let dateString = "";
  $: date = new Date(dateString);
  let poolSize = "SCY";

  let meetId = "";

  const submit = async () => {
    const doc = await addDoc(collection(firestore, "meets"), {
      team: $userData?.team,
      registered: [],
      poolSize,
      capacity,
      date,
      location,
      createdAt: new Date(),
    });

    for (const event of events) {
      await addDoc(collection(firestore, `${doc.path}/events`), event);
    }

    meetId = doc.id;

    step = 4;
  };

  const confirmation = {
    capacity: false,
    date: false,
    location: false,
    poolSize: false,
    events: false,
    available: false,
  };
</script>

<div class="flex justify-center">
  <div class="steps">
    <button
      class="step cursor-pointer"
      on:click={() => (step = Math.min(step, 1))}
      class:step-primary={step >= 1}>Basic Information</button
    >
    <button
      class="step cursor-pointer"
      on:click={() => (step = Math.min(step, 2))}
      class:step-primary={step >= 2}>Events</button
    >
    <button
      class="step cursor-pointer"
      on:click={() => (step = Math.min(step, 3))}
      class:step-primary={step >= 3}>Confirmation</button
    >
    <button
      class="step cursor-pointer"
      on:click={() => (step = Math.min(step, 4))}
      class:step-primary={step >= 4}>Success</button
    >
  </div>
</div>

<h1 class="mx-auto mb-2 max-w-screen-lg text-4xl font-bold">Create a meet</h1>

<div class="overflow-x-hidden">
  {#if step == 1}
    <div
      class="mx-auto flex max-w-screen-lg flex-col"
      in:fly={{ x: "100%", duration: 250, delay: 250 }}
      out:fly={{ x: "-100%", duration: 250 }}
    >
      <form on:submit|preventDefault={() => (step = 2)} class="flex flex-col">
        <p>How many people will be able to attend this meet?</p>

        <input type="number" class="input input-bordered" bind:value={capacity} required />

        <p class="mt-4">What is the date and time of the meet?</p>

        <input
          type="datetime-local"
          class="input input-bordered"
          bind:value={dateString}
          required
        />

        <p class="mt-4">What is the location of the meet?</p>

        <input class="input input-bordered" bind:value={location} required />

        <p class="mt-4">What type of pool is this?</p>

        <select class="select select-bordered" bind:value={poolSize} required>
          <option value="SCY">Short Course Yards</option>
          <option value="SCM">Short Course Meters</option>
          <option value="LCM">Long Course Meters</option>
        </select>

        <button class="btn btn-primary mt-8">Next</button>
      </form>
    </div>
  {:else if step === 2}
    <div
      class="mx-auto flex max-w-screen-lg flex-col"
      in:fly={{ x: "100%", duration: 250, delay: 250 }}
      out:fly={{ x: "-100%", duration: 250 }}
    >
      <h2 class="mt-8 text-2xl font-bold">Events</h2>
      <button
        class="btn btn-primary ml-auto"
        on:click={() => open(CreateEventModal, { poolSize, addEvent })}>Add Event</button
      >
      <div class="mt-4 overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <th>Gender</th>
            <th>Age</th>
            <th>Stroke</th>
            <th>Distance</th>
          </thead>
          <tbody>
            {#each events as event}
              <tr>
                <td>{genderToName(event.gender)}</td>
                <td>{event.age}</td>
                <td>{formatStroke(event.stroke)}</td>
                <td>{event.length}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <button
        class="btn btn-primary mt-8"
        on:click={() => (step = 3)}
        disabled={events.length === 0}>Next</button
      >
    </div>
  {:else if step === 3}
    <div
      class="mx-auto flex max-w-screen-lg flex-col"
      in:fly={{ x: "100%", duration: 250, delay: 250 }}
      out:fly={{ x: "-100%", duration: 250 }}
    >
      <h2 class="mt-8 text-2xl font-bold">Confirmation</h2>
      <p>Please verify the following information is correct:</p>
      <label class="mt-4 flex gap-x-1">
        <input
          type="checkbox"
          class="checkbox-primary checkbox"
          bind:checked={confirmation.capacity}
        />

        <span
          >The venue can hold, and you are prepared to host, <span class="font-bold"
            >{capacity}</span
          > swimmers.</span
        >
      </label>

      <label class="mt-2 flex gap-x-1">
        <input type="checkbox" class="checkbox-primary checkbox" bind:checked={confirmation.date} />

        <span
          >The meet starts at <span class="font-bold"
            >{DateTime.fromJSDate(date)
              .setLocale("en-US")
              .setZone("UTC")
              .toLocaleString(DateTime.DATETIME_MED)}</span
          >.</span
        >
      </label>

      <label class="mt-2 flex gap-x-1">
        <input
          type="checkbox"
          class="checkbox-primary checkbox"
          bind:checked={confirmation.location}
        />

        <span>The meet is located at <span class="font-bold">{location}</span>.</span>
      </label>

      <label class="mt-2 flex gap-x-1">
        <input
          type="checkbox"
          class="checkbox-primary checkbox"
          bind:checked={confirmation.poolSize}
        />

        <span>The pool is a <span class="font-bold">{poolSize}</span> pool.</span>
      </label>

      <label class="mt-2 flex gap-x-1">
        <input
          type="checkbox"
          class="checkbox-primary checkbox"
          bind:checked={confirmation.events}
        />

        The following events are scheduled:
      </label>

      <div class="rounded-2xl bg-base-200 px-8 py-2">
        <ul class="ml-4 max-h-40 list-inside list-disc overflow-y-auto">
          {#each events as event}
            <li>{eventToName(event)}</li>
          {/each}
        </ul>
      </div>

      <label class="mt-2 flex gap-x-1">
        <input
          type="checkbox"
          class="checkbox-primary checkbox"
          bind:checked={confirmation.available}
        />

        This venue is available (preferably already booked) for this meet.
      </label>

      <button
        class="btn btn-primary mt-8"
        on:click={submit}
        disabled={Object.values(confirmation).some((value) => !value)}>Submit</button
      >
    </div>
  {:else if step === 4}
    <div
      class="mx-auto max-w-screen-lg"
      in:fly={{ x: "100%", duration: 250, delay: 250 }}
      out:fly={{ x: "-100%", duration: 250 }}
    >
      <MeetCreationSuccessModal id={meetId} />
    </div>
  {/if}
</div>
