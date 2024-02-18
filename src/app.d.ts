// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  declare class QRCode {
    constructor(element: HTMLElement, text: string);
    constructor(element: HTMLElement, options: {
      text: string;
      colorLight?: string;
      colorDark?: string;
    });
  }
}

export {};
