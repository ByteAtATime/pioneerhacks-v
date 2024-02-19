<script lang="ts">
  import { Collection, Doc } from "sveltefire";
  import { userStore } from "sveltefire";
  import { auth } from "$lib/firebase";
  import { DateTime } from "luxon";

  const user = userStore(auth);
</script>

<Doc ref="users/{$user?.uid}" let:data={userData}>
  {#if userData.role === "coach"}
    <Collection ref="meets" let:data={meets}>
      <div class="flex flex-col">
        <h1 class="text-4xl font-bold">Upcoming Meets</h1>

        <a class="btn btn-primary ml-auto" href="/meets/create">Create Meet</a>

        <!-- table with meets -->
        <div class="mt-4 overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Location</th>
                <th>Date</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each meets as meet}
                <tr>
                  <td>{meet.location}</td>
                  <td
                    >{DateTime.fromJSDate(meet.date.toDate())
                      .setLocale("en-US")
                      .toLocaleString(DateTime.DATETIME_MED)}</td
                  >
                  <td>
                    <Collection ref="meets/{meet.id}/registrations" let:data={registrations}
                      >{registrations.length}/{meet.capacity}</Collection
                    ></td
                  >
                  <td>
                    <a href="/meets/{meet.id}" class="btn btn-secondary">View</a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </Collection>
  {:else}
    <Collection ref="meets" let:data={meets}>
      <div class="flex flex-col">
        <h1 class="text-4xl font-bold">Upcoming Meets</h1>

        {#each meets.filter((meet) => userData.registeredMeets?.includes(meet.id)) as meet}
          <div class="mt-4 rounded-2xl bg-base-300 p-8">
            <h2 class="text-2xl font-bold">{meet.location}</h2>
            <p>
              {DateTime.fromJSDate(meet.date.toDate())
                .setLocale("en-US")
                .toLocaleString(DateTime.DATETIME_MED)}
            </p>
            <a href="/meets/{meet.id}" class="btn btn-primary mt-2">View</a>
          </div>
        {/each}
      </div>
    </Collection>
  {/if}
</Doc>
