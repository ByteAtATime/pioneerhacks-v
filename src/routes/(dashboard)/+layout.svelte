<script lang="ts">
  import { auth, firestore } from "$lib/firebase";
  import { signOut } from "firebase/auth";
  import {
    Icon,
    Bars3,
    CalendarDays,
    ArrowTrendingUp,
    Sun,
    Moon,
    ChatBubbleBottomCenterText,
    UserGroup,
  } from "svelte-hero-icons";
  import { userStore, Doc } from "sveltefire";
  import { onMount } from "svelte";
  import { collection, addDoc } from "firebase/firestore";
  import { formatTime } from "$lib/event";

  const user = userStore(auth);

  let toggleTheme = false;
  let isThemeStored = false;

  onMount(() => {
    toggleTheme = localStorage.getItem("theme") === "night";
    isThemeStored = true;
  });

  $: if (isThemeStored) {
    if (toggleTheme) {
      document.documentElement.setAttribute("data-theme", "night");
      localStorage.setItem("theme", "night");
    } else {
      document.documentElement.setAttribute("data-theme", "autumn");
      localStorage.setItem("theme", "autumn");
    }
  }
</script>

<Doc ref="users/{$user?.uid}" let:data={userData}>
  <div class="drawer lg:drawer-open">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <div class="navbar bg-base-100 lg:hidden">
        <div class="flex-1">
          <label for="my-drawer-2" class="drawer-button max-w-8"><Icon src={Bars3} /></label>
        </div>
        <div class="flex-none">
          <div class="dropdown dropdown-end">
            <button tabindex="0" class="avatar btn btn-ghost">
              <img src={$user?.photoURL} class="rounded-full" alt="Avatar" />
            </button>
            <ul
              tabindex="0"
              class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li><button on:click={() => signOut(auth)}>Sign Out</button></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="p-8">
        {#if userData.team}
          <slot />
        {:else}
          <h1 class="mb-2 text-4xl font-bold">You don't seem to be on a team!</h1>
          <p>Tell your coach to invite you to the team!</p>
        {/if}
      </div>
    </div>
    <div class="drawer-side">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu flex h-full min-h-full w-80 flex-col bg-base-200 p-4 text-base-content">
        {#if userData.role === "swimmer"}
          <li><a href="/" class="mb-4 text-lg font-bold">Home</a></li>
          <li>
            <a href="/meets"
              ><Icon src={CalendarDays} class="w-8 text-gray-600" /> Your Meet Calendar</a
            >
          </li>
          <li>
            <a href="/stats"><Icon src={ArrowTrendingUp} class="w-8 text-gray-600" /> Stats</a>
          </li>
          <li>
            <a href="/infoboard"
              ><Icon src={ChatBubbleBottomCenterText} class="w-8 text-gray-600" /> Info Board</a
            >
          </li>
        {:else}
          <li><a href="/" class="mb-4 text-lg font-bold">Home</a></li>
          <li><a href="/meets"><Icon src={CalendarDays} class="w-8 text-gray-600" /> Meets</a></li>
          <li>
            <a href="/team"><Icon src={UserGroup} class="w-8 text-gray-600" /> Team Management</a>
          </li>
          <li>
            <a href="/infoboard"
              ><Icon src={ChatBubbleBottomCenterText} class="w-8 text-gray-600" /> Info Board</a
            >
          </li>
        {/if}
        <li class="flex-1">&nbsp;</li>
        <div class="flex items-center">
          <label class="swap swap-rotate mr-2">
            <input type="checkbox" bind:checked={toggleTheme} />

            <Icon src={Moon} class="swap-on w-8 fill-current text-gray-600" />

            <Icon src={Sun} class="swap-off w-8 fill-current text-gray-600" />
          </label>
          <span class="text-xl">{$user?.displayName}</span>
          <span class="flex-1"></span>

          <div class="dropdown dropdown-end dropdown-top">
            <button tabindex="0" class="avatar btn btn-ghost hover:bg-transparent">
              <img src={$user?.photoURL} class="rounded-full" alt="Avatar" />
            </button>
            <ul
              tabindex="0"
              class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li><button on:click={() => signOut(auth)}>Sign Out</button></li>
            </ul>
          </div>
        </div>
      </ul>
    </div>
  </div>
</Doc>
