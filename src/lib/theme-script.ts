/** Inline script for <head> so the right theme paints before React loads. */
export const themeScript = `try{var t=localStorage.getItem("2birds:theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;
