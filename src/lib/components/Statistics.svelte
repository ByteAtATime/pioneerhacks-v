<script lang="ts">
  import { Chart, registerables } from "chart.js";
  import { onMount } from "svelte";
  import { collectionStore, userStore } from "sveltefire";
  import { auth, firestore } from "$lib/firebase";
  import { browser } from "$app/environment";
  import { type DocumentData, getDocs, collection } from "firebase/firestore";
  import { keyToEvent, eventToShortName, timeStringToMilliseconds } from "$lib/event";
  import "chartjs-adapter-luxon"

  export let userId: string;

  let speeds: HTMLCanvasElement;

  let chart: { chart: Chart<"line", { x: string; y: number }[], string> } = {};

  const drawToChart = async () => {
    const data: Record<string, { x: string; y: number }[]> = {};
    const history = await getDocs(collection(firestore, `users/${userId}/history`)).then(
      (snapshot) => snapshot.docs,
    );
    for (const doc of history.sort(
      (a, b) => a.data().timestamp.toDate().getTime() - b.data().timestamp.toDate().getTime(),
    )) {
      for (const event in doc.data().times) {
        const eventObj = keyToEvent(event);
        if (!data[eventToShortName(eventObj)]) {
          data[eventToShortName(eventObj)] = [];
        }

        data[eventToShortName(eventObj)].push({
          x: doc.data().timestamp.toDate(),
          y: timeStringToMilliseconds(doc.data().times[event]) / 1000,
        });
      }
    }

    const datasets = Object.entries(data).map(([event, times]) => ({
      label: event,
      data: times.map((time) => ({ x: time.x, y: time.y })),
    }));

    const newChart = new Chart(speeds, {
      type: "line",
      data: {
        datasets,
      },
      options: {
        scales: {
          x: {
            type: "time",
          },
        },
      },
    });

    console.log(datasets);

    Object.assign(chart, { chart: newChart });
  };

  onMount(async () => {
    Chart.register(...registerables);

    await drawToChart();
  });

  $: if (userId) {
    chart?.chart?.destroy();

    drawToChart();
  }
</script>

<canvas bind:this={speeds} />
