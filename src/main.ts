import { initParticles } from "./particles";

const EMAIL = "ignaciocarlos016@gmail.com";

const bgCanvas = document.querySelector<HTMLCanvasElement>("#bg-canvas");
if (bgCanvas) {
  initParticles(bgCanvas);
}

const copyButton = document.querySelector<HTMLButtonElement>("#copy-email");
const copySub = document.querySelector<HTMLSpanElement>("#copy-email-sub");

copyButton?.addEventListener("click", async () => {
  await navigator.clipboard.writeText(EMAIL);
  if (copySub) {
    copySub.textContent = "¡Copiado!";
    setTimeout(() => {
      copySub.textContent = EMAIL;
    }, 1500);
  }
});
