<script lang="ts">
  import { goto } from "$app/navigation";
  import { getContext } from "svelte";
  import type { Context } from "svelte-simple-modal";

  let id = "";

  $: validId = /^[-_0-9A-Za-z]{20}$/.test(id);

  const { close } = getContext("simple-modal") as Context;

  const submit = () => {
    goto(`/meets/${id}/signup`);

    close();
  };
</script>

<h2 class="mb-4 text-2xl font-bold">Join Meet</h2>

<form class="flex flex-col" on:submit|preventDefault={submit}>
  <label class="form-control">
    <div class="label"><span class="label-text">Meet ID</span></div>
    <input class="input input-bordered" bind:value={id} />

    {#if !validId}
      <p class="mt-2 text-error">
        This doesn't seem like a valid ID. Are you sure you typed it correctly?
      </p>
    {/if}
  </label>

  <button class="btn btn-primary mt-4" disabled={!validId}>Continue</button>
</form>
