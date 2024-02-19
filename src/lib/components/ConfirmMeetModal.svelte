<script lang="ts">
  import { getContext } from "svelte";
  import type { Context } from "svelte-simple-modal";

  export let submit: () => void;

  const { close } = getContext("simple-modal") as Context;

  const confirm = () => {
    submit();
  };
</script>

<h2 class="text-2xl font-bold">Confirm meet creation</h2>

<p class="w-2/3">
  Are you sure all the details are correct? You cannot change it after you submit!
</p>

<div class="mt-4 flex gap-4">
  <button class="btn btn-primary" on:click={confirm}>Yes, create meet</button>
  <button class="btn btn-secondary" on:click={close}>No, go back</button>
</div>
