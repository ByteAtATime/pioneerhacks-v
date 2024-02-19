<script lang="ts">
  import { userStore, Doc, Collection, docStore } from "sveltefire";
  import { auth, firestore } from "$lib/firebase";
  import { keyToEvent, timeToStandard, eventToName, formatTime, pbSorter } from "$lib/event";
  import { DateTime } from "luxon";
  import type { DocumentData } from "firebase/firestore";
  import { getContext } from "svelte";
  import type { Context } from "svelte-simple-modal";
  import JoinMeetByIdModal from "$lib/components/JoinMeetByIdModal.svelte";

  const user = userStore(auth);

  const { open } = getContext("simple-modal") as Context;
</script>

<Doc ref="users/{$user?.uid}" let:data={userData}>
  <h1 class="text-center text-4xl font-bold">Welcome back, {userData.name}</h1>
  {#if userData.role === "swimmer"}
    <h2 class="text-2xl font-bold">Actions</h2>

    <div class="flex">
      <button class="btn btn-primary" on:click={() => open(JoinMeetByIdModal)}>Join a meet</button>
    </div>

    <h2 class="mt-4 text-2xl font-bold">Personal Bests</h2>

    <Collection ref="users/{$user?.uid}/pbs" let:data={personalBests}>
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <th>Event</th>
            <th>Time</th>
            <th>Date Achieved</th>
            <th>Standard Met</th>
          </thead>
          <tbody>
            {#each personalBests.sort(pbSorter).slice(-5) as pb}
              <tr>
                <td>{eventToName(keyToEvent(pb.id))}</td>
                <td>{formatTime(pb.time)}</td>
                <td
                  >{DateTime.fromJSDate(pb.achievedOn.toDate())
                    .setLocale("en-US")
                    .toLocaleString(DateTime.DATETIME_MED)}</td
                >
                <td>{timeToStandard(keyToEvent(pb.id), pb.time)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Collection>
  {:else}
    <Doc ref={userData.team} let:data={team}>
      <p class="text-center">You are coaching <span class="font-bold">{team.name}</span></p>

      <h2 class="text-2xl font-bold">Actions</h2>

      <div class="flex">
        <a href="/meets/create"><button class="btn btn-primary">Create a meet</button></a>
      </div>
    </Doc>
  {/if}
</Doc>
