<script lang="ts">
  import { auth, firestore } from "$lib/firebase";
  import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
  import "../app.css";
  import { userStore, SignedIn, FirebaseApp, SignedOut } from "sveltefire";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  import type { UserData } from "$lib/user";
  import { onMount } from "svelte";
  import Modal from "svelte-simple-modal";
  import SignInWithGoogle from "$lib/components/SignInWithGoogle.svelte";

  const provider = new GoogleAuthProvider();

  let email = "";
  let password = "";

  let error = "";

  const signInWithPassword = () => {
    signInWithEmailAndPassword(auth, email, password).catch(e => {
      createUserWithEmailAndPassword(auth, email, password).catch(e2 => {
        error = "Invalid credentials. If you signed up with a social, use that to sign in.";
      });
    })
  }

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, provider);

    const userDoc = await getDoc(doc(firestore, "users", res.user.uid));

    if (!userDoc.exists()) {
      await setDoc(doc(firestore, "users", res.user.uid), {
        name: res.user.displayName,
        email: res.user.email,
        photoURL: res.user.photoURL,
        createdAt: new Date(),
        role: "swimmer",
      } satisfies UserData);
    }
  };
</script>

<FirebaseApp {auth} {firestore}>
  <Modal classWindow="!bg-base-100 !text-base-content">
    <SignedIn>
      <slot />
    </SignedIn>

    <SignedOut>
      <div class="flex min-h-screen items-center justify-center">
        <div class="flex items-center">
          <div class="flex flex-col gap-y-4 w-80">
            <label class="form-control">
              <div class="label"><span class="label-text">Email</span></div>
              <input class="input input-bordered" type="email" bind:value={email} />
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Password</span></div>
              <input class="input input-bordered" type="password" bind:value={password} />
            </label>
            {#if error}
              <p class="text-error">{error}</p>
            {/if}
            <button class="btn btn-primary" on:click={signInWithPassword}>Sign In</button>
          </div>
          <div class="divider divider-horizontal mx-8">OR</div>
          <div class="flex flex-col">
          <button class="btn btn-secondary" on:click={signInWithGoogle}>
            <SignInWithGoogle />
          </button>
        </div>
        </div>
      </div>
    </SignedOut>
  </Modal>
</FirebaseApp>
