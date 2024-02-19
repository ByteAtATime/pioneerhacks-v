<script lang="ts">
  import { collectionStore, docStore, userStore } from "sveltefire";
  import { page } from "$app/stores";
  import { DateTime } from "luxon";
  import { auth, firestore } from "$lib/firebase";
  import {
    birthdateToAge,
    eventToName,
    eventToKey,
    findEventsForAge,
    type Event,
  } from "$lib/event";
  import { getContext } from "svelte";
  import type { Context } from "svelte-simple-modal";
  import ConfirmMeetSignupModal from "$lib/components/ConfirmMeetSignupModal.svelte";
  import type { WithID } from "$lib/types";

  const id = $page.params.id;

  const user = userStore(auth);
  const userData = docStore(firestore, `users/${$user?.uid}`);

  let birthdateString: string | null = null;
  let gender: "boy" | "girl" | null = null;

  let chosenEvents: Record<string, boolean> = {};

  const { open } = getContext("simple-modal") as Context;

  const meet = docStore(firestore, `meets/${id}`);

  const events = collectionStore<WithID<Event>>(firestore, `meets/${id}/events`);

  $: birthdate = birthdateString ? new Date(birthdateString) : null;
  $: hasChosenEvents = Object.values(chosenEvents).some((v) => v);
</script>

{#if $meet === null}
  <div class="mx-auto flex max-w-screen-lg flex-col items-center p-8">
    <h1 class="text-4xl font-bold">Meet not found</h1>
    <p>It seems like the meet you're trying to sign up for doesn't exist. Maybe it was deleted?</p>
    <a href="/" class="btn btn-secondary mx-auto mt-4">Go back home</a>
  </div>
{:else if $meet !== undefined}
  <div class="mx-auto max-w-screen-lg p-8">
    {#if new Date() > new Date($meet.date.toDate() - 48 * 60 * 60 * 1000)}
      <div class="flex flex-col items-center">
        <h1 class="mb-2 text-4xl font-bold">It's too late to sign up!</h1>
        <p>Signups end 48 hours before the meet starts. Maybe choose another meet?</p>
        <a href="/" class="btn btn-secondary mx-auto mt-4">Go back home</a>
      </div>
    {:else}
      <h1 class="text-4xl font-bold">Sign up for meet</h1>
      <p class="mt-2">
        Meet at {$meet.location} on {DateTime.fromJSDate($meet.date.toDate())
          .setLocale("en-US")
          .toLocaleString(DateTime.DATETIME_MED)}
      </p>

      {#if !$userData.birthdate}
        <div class="mt-6 rounded-2xl bg-base-300 p-8">
          <p>
            You don't seem to have a birthdate set. Please enter it here, and it will be saved for
            future meets.
          </p>
          <input type="date" bind:value={birthdateString} class="input input-bordered mt-2" />
        </div>
      {/if}

      {#if !$userData.gender}
        <div class="mt-6 rounded-2xl bg-base-300 p-8">
          <p>
            You don't seem to have a gender set. Please enter it here, and it will be saved for
            future meets.
          </p>
          <label class="form-control w-min">
            <div class="label cursor-pointer">
              <input
                type="radio"
                name="gender"
                class="radio"
                on:change={(e) => (gender = e.target.checked ? "boy" : "girl")}
              />
              <span class="label-text ml-2">Male</span>
            </div>
          </label>
          <label class="form-control w-min">
            <div class="label cursor-pointer">
              <input
                type="radio"
                name="gender"
                class="radio"
                on:change={(e) => (gender = e.target.checked ? "girl" : "boy")}
              />
              <span class="label-text ml-2">Female</span>
            </div>
          </label>
        </div>
      {/if}

      {#key birthdate}
        {#if ($userData.birthdate ?? birthdate) && ($userData.gender ?? gender)}
          <div class="mt-4 flex flex-col gap-y-2">
            {#each findEventsForAge(birthdateToAge(birthdate ?? $userData.birthdate.toDate()), $userData.gender ?? gender, $events) as event (eventToKey(event))}
              <label class="flex items-center gap-x-1">
                <input
                  type="checkbox"
                  class="checkbox-primary checkbox"
                  on:change={(e) => (chosenEvents[eventToKey(event)] = e.target.checked)}
                />
                {eventToName(event)}
              </label>
            {/each}
          </div>

          {#if hasChosenEvents}
            <button
              class="btn btn-primary mt-4"
              disabled={!hasChosenEvents}
              on:click={() =>
                open(ConfirmMeetSignupModal, {
                  meet,
                  id,
                  gender: $userData.gender ?? gender,
                  birthdate: $userData.birthdate?.toDate() ?? birthdate,
                  chosenEvents: Object.keys(chosenEvents).filter((key) => chosenEvents[key]),
                })}
            >
              Sign up
            </button>
          {/if}
        {/if}
      {/key}
    {/if}
  </div>
{/if}
