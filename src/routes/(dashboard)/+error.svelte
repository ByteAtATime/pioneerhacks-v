<script>
  import { page } from "$app/stores";
</script>

<div class="flex flex-col items-center">
  <h1 class="mb-2 text-4xl font-bold">{$page.status}</h1>

  <p>{$page.error?.message}</p>

  <a href="/" class="btn btn-primary mt-4">Go back home</a>
</div>
