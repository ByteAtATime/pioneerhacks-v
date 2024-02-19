<script>
  import Statistics from "$lib/components/Statistics.svelte";
  import { auth } from "$lib/firebase";
  import { userStore } from "sveltefire";

  const user = userStore(auth);
</script>

<Statistics userId={$user?.uid ?? ""} />
