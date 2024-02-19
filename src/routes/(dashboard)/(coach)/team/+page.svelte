<script lang="ts">
  import { auth, firestore } from "$lib/firebase";
  import { collection, query, where, getDoc, doc, getDocs, updateDoc } from "firebase/firestore";
  import { collectionStore, userStore, Doc } from "sveltefire";
  import Statistics from "$lib/components/Statistics.svelte";

  const user = userStore(auth);
  const coaches = collectionStore(
    firestore,
    query(collection(firestore, "users"), where("role", "==", "coach")),
  );
  const swimmers = collectionStore(
    firestore,
    query(collection(firestore, "users"), where("role", "==", "swimmer")),
  );

  let addSwimmerEmail = "";
  let addSwimmerError = "";

  const addSwimmer = async (team: Document) => {
    addSwimmerError = "";
    const swimmer = (
      await getDocs(query(collection(firestore, "users"), where("email", "==", addSwimmerEmail)))
    ).docs[0];

    if (!swimmer) {
      addSwimmerError = "No swimmer with that email found";
      return;
    }

    if (swimmer.data().role !== "swimmer") {
      addSwimmerError = "That user is not a swimmer";
      return;
    }

    if (swimmer.data().team) {
      addSwimmerError = "That swimmer is already on a team";
      return;
    }

    await updateDoc(swimmer.ref, {
      team,
    });

    addSwimmerEmail = "";
  };

  let selectedStatistic: string|null = null;
</script>

<h1 class="mb-4 text-4xl font-bold">Team Management</h1>

<hr />

<h2 class="mt-4 text-2xl font-bold">Coaches</h2>

<Doc ref="users/{$user?.uid}" let:data={userData}>
  <ul class="list-inside list-disc">
    {#each $coaches.filter((coach) => coach.team?.path === userData.team.path) as coach}
      <li>{coach.name} <a href="mailto:{coach.email}" class="underline">{coach.email}</a></li>
    {/each}
  </ul>

  <h2 class="mt-4 text-2xl font-bold">Swimmers</h2>

  <ul class="list-inside list-disc">
    {#each $swimmers.filter((swimmer) => swimmer.team?.path === userData.team.path) as swimmer}
      <li>{swimmer.name} <a href="mailto:{swimmer.email}" class="underline">{swimmer.email}</a></li>
    {/each}
  </ul>

  <form class="mt-4 flex gap-x-2">
    <input
      class="input input-bordered"
      placeholder="Email"
      type="email"
      bind:value={addSwimmerEmail}
    />
    <button class="btn btn-primary" on:click={() => addSwimmer(userData.team)}>Add swimmer</button>
  </form>
  <p class="text-error">{addSwimmerError}</p>

  <hr class="mt-4 mb-8" />

  <h2 class="text-2xl font-bold">Statistics</h2>

  <select class="select select-bordered mt-2" bind:value={selectedStatistic}>
    <option value={null}>Select a swimmer</option>
    {#each $swimmers.filter((swimmer) => swimmer.team?.path === userData.team.path) as swimmer}\
      <option value={swimmer.id}>{swimmer.name}</option>
    {/each}
  </select>

  {#if selectedStatistic}
    <Statistics userId={selectedStatistic} />
  {/if}
</Doc>
