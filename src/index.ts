import draw from "./demo/cube";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const gl = canvas.getContext("webgl2");

draw(gl);
