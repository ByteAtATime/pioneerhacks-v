<script lang="ts">
  import type { Event } from "$lib/event";
  import { getContext } from "svelte";
  import type { Context } from "svelte-simple-modal";
  export let poolSize: "LCM" | "SCM" | "SCY";
  export let addEvent: (event: Event) => void;

  const distanceDivisor = poolSize === "LCM" ? 50 : 25;
  const unit = poolSize === "SCY" ? "Y" : "M";

  let genders = {
    boy: false,
    girl: false,
  };
  let ages = {
    "10 & under": false,
    "11-12": false,
    "13-14": false,
    "15-16": false,
    "17-18": false,
  };
  let distance = 50;
  let stroke = "free";

  const { close } = getContext("simple-modal") as Context;

  const submit = () => {
    // for each selected gender, for each selected age, create an event and call addEvent
    for (const gender of Object.keys(genders).filter((gender) => genders[gender])) {
      for (const age of Object.keys(ages).filter((age) => ages[age])) {
        addEvent({
          poolSize,
          gender: gender as "boy" | "girl",
          age: age as "10 & under" | "11-12" | "13-14" | "15-16" | "17-18",
          stroke: stroke as "free" | "back" | "breast" | "fly" | "IM",
          length: distance,
        });
      }
    }

    close();
  };
</script>

<h2 class="text-2xl font-bold">Create Event</h2>

<form class="flex flex-col" on:submit|preventDefault={submit}>
  <p>* One event will be created per selection</p>

  <label class="form-control">
    <div class="label"><span class="label-text">Genders *</span></div>
    <label class="mb-1 flex gap-x-1"
      ><input type="checkbox" class="checkbox-primary checkbox" bind:value={genders.boy} /> Boys</label
    >
    <label class="mb-1 flex gap-x-1"
      ><input type="checkbox" class="checkbox-primary checkbox" bind:value={genders.girl} /> Girls</label
    >
  </label>

  <label class="form-control mt-4">
    <div class="label"><span class="label-text">Ages *</span></div>
    <label class="mb-1 flex gap-x-1"
      ><input type="checkbox" class="checkbox-primary checkbox" bind:value={ages["10 & under"]} /> 10
      & Under</label
    >
    <label class="mb-1 flex gap-x-1"
      ><input type="checkbox" class="checkbox-primary checkbox" bind:value={ages["11-12"]} /> 11-12</label
    >
    <label class="mb-1 flex gap-x-1"
      ><input type="checkbox" class="checkbox-primary checkbox" bind:value={ages["13-14"]} /> 13-14</label
    >
    <label class="mb-1 flex gap-x-1"
      ><input type="checkbox" class="checkbox-primary checkbox" bind:value={ages["15-16"]} /> 15-16</label
    >
    <label class="mb-1 flex gap-x-1"
      ><input type="checkbox" class="checkbox-primary checkbox" bind:value={ages["17-18"]} /> 17-18</label
    >
  </label>

  <label class="form-control mt-4">
    <div class="label"><span class="label-text">Stroke</span></div>
    <select class="select select-bordered" bind:value={stroke}>
      <option value="free">Freestyle</option>
      <option value="back">Backstroke</option>
      <option value="breast">Breaststroke</option>
      <option value="fly">Butterfly</option>
      <option value="IM">Individual Medley</option>
    </select>
  </label>

  <label class="form-control mt-4">
    <div class="label"><span class="label-text">Distance</span></div>
    <input type="number" class="input input-bordered" bind:value={distance} />
    {#if distance % distanceDivisor !== 0}
      <p class="text-error">Events should be multiples of {distanceDivisor} {unit}</p>
    {/if}
  </label>

  <button class="btn btn-primary mt-8">Create</button>
</form>
