<script lang="ts">
  import { auth, firestore } from "$lib/firebase";
  import { ref } from "firebase/database";
  import { addDoc, collection, doc } from "firebase/firestore";
  import type { Context } from "svelte-simple-modal";
  import { userStore } from "sveltefire";
  import { getContext } from "svelte";

  export let team: string;

  const user = userStore(auth);

  let title = "";
  let content = "";

  const { close } = getContext("simple-modal") as Context;

  const submit = async () => {
    await addDoc(collection(firestore, `${team}/infoboard`), {
      title,
      content,
      postedBy: doc(firestore, `users/${$user?.uid}`),
      postedAt: new Date(),
    });

    close();
  };
</script>

<h2 class="text-2xl font-bold">Create Post</h2>

<form class="flex flex-col" on:submit|preventDefault={submit}>
  <label class="form-control">
    <div class="label"><span class="label-text">Title</span></div>
    <input class="input input-bordered" bind:value={title} />
  </label>

  <label class="form-control">
    <div class="label"><span class="label-text">Content</span></div>
    <textarea class="textarea textarea-bordered" rows="5" bind:value={content} />
  </label>

  <button class="btn btn-primary mt-4">Create Post</button>
</form>
