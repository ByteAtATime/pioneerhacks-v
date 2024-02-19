<script lang="ts">
  import { auth, firestore } from "$lib/firebase";
  import type { UserData, InfoboardPost, WithID } from "$lib/types";
  import { docStore, Doc, userStore, collectionStore } from "sveltefire";
  import { getContext } from "svelte";
  import { type Readable, type Stores, derived } from "svelte/store";
  import type { Context } from "svelte-simple-modal";
  import CreatePostModal from "$lib/components/CreatePostModal.svelte";
  import { DateTime } from "luxon";
  import { slide } from "svelte/transition";

  const user = userStore(auth);
  const userData = docStore<UserData>(firestore, `users/${$user?.uid}`);
  let infoboard: ReturnType<typeof collectionStore<WithID<InfoboardPost>>>;
  let authors: Readable<Record<string, UserData>>;

  $: if ($userData) {
    infoboard = collectionStore<WithID<InfoboardPost>>(
      firestore,
      `${$userData?.team.path}/infoboard`,
    );
  }

  $: if ($infoboard) {
    const paths = [...new Set($infoboard.map((post) => post.postedBy.path))];
    authors = derived(
      paths.map((path) => docStore<UserData>(firestore, path)) as Stores,
      ($authors) => {
        const result: Record<string, UserData> = {};

        $authors.forEach((author, idx) => {
          result[paths[idx].split("/").at(-1)!] = author;
        });

        return result;
      },
    );
  }

  const { open } = getContext("simple-modal") as Context;
</script>

<div class="mx-auto max-w-screen-lg">
  <h1 class="text-4xl font-bold" class:mb-8={$userData?.role === "swimmer"}>Info Board</h1>

  <div class="flex flex-col gap-y-4">
    {#if $userData?.role === "coach"}
      <button
        class="btn btn-primary ml-auto"
        on:click={() => open(CreatePostModal, { team: $userData?.team.path })}>Create Post</button
      >
    {/if}

    {#if $infoboard}
      {#each $infoboard.sort((a, b) => b.postedAt - a.postedAt) as post (post.id)}
        <div class="card bg-base-200 shadow-xl" in:slide>
          <div class="card-body">
            <h2 class="card-title">{post.title}</h2>
            <p>{post.content}</p>
            <div class="card-actions justify-end">
              <div class="flex items-center gap-x-2">
                {DateTime.fromJSDate(post.postedAt.toDate())
                  .setLocale("en-US")
                  .toLocaleString(DateTime.DATETIME_MED)} by
                <div class="avatar">
                  <div class="w-8 rounded-full">
                    <img src={$authors[post.postedBy.id]?.photoURL} alt="Author avatar" />
                  </div>
                </div>
                {$authors[post.postedBy.id]?.name}
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
