<script lang="ts">
  import { goto } from "$app/navigation";
  import { getContext, onMount } from "svelte";
  import type { Context } from "svelte-simple-modal";

  export let id: string;

  let qrcode: HTMLDivElement;

  onMount(() => {
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
  });

  let link = `${id}`;

  const { close } = getContext("simple-modal") as Context;

  const copy = () => {
    navigator.clipboard.writeText(`http://localhost:5173/meets/${id}/signup`);

    link = "Link copied!";

    setTimeout(() => {
      link = `${id}`;
    }, 700);
  };
</script>

<div class="flex flex-col">
  <h2 class="mb-4 text-center text-4xl font-bold">Success!</h2>

  <div bind:this={qrcode} class="mx-auto" />

  <button
    class="mx-auto mt-4 w-min whitespace-nowrap rounded-2xl bg-blue-200 px-16 py-4 font-mono text-xl font-bold text-black"
    on:click={copy}>{link}</button
  >

  <p class="mt-6 text-center text-lg">
    Share this QR code with your swimmers to allow them to sign up for the meet.
  </p>

  <p class="mt-2 text-center">(psst: you can click on the ID to copy a link!)</p>

  <button
    class="btn btn-secondary mt-4"
    on:click={() => {
      close();
      goto("/meets");
    }}>Continue</button
  >
</div>
