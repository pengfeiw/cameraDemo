import {glMatrix, mat4, vec3} from "gl-matrix";
import Shader from "../util/shader";
import Camera, {Camera_Movement} from "../util/camera";

const vertex_source =
    `#version 300 es
    
    in vec3 a_pos;
    in vec3 a_color;

    out vec3 v_color;

    uniform mat4 projection;
    uniform mat4 view;
    uniform mat4 model;

    void main() {
        gl_Position = projection * view * model * vec4(a_pos, 1.0);
        v_color = a_color;
    }
`;

const fragment_source =
    `#version 300 es
    precision highp float;

    out vec4 FragColor;

    in vec3 v_color;

    void main() {
        FragColor = vec4(v_color, 1.0);
    }
`
const vertices = [
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,

    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,

    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,

    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,

    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,

    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5
];

const getColor = () => {
    const colors: number[] = [];
    for (let i = 0; i < vertices.length / 18; i++) {
        const r = Math.random();
        const g = Math.random();
        const b = Math.random();

        for (let j = 0; j < 6; j++) {
            colors.push(r, g, b);
        }
    }

    return colors;
};

const resizeCanvas = (gl: WebGL2RenderingContext) => {
    const canvas = gl.canvas as HTMLCanvasElement;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width != displayWidth || canvas.height != displayHeight) {
        canvas.height = displayHeight;
        canvas.width = displayWidth;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
};

const draw = (gl: WebGL2RenderingContext) => {
    // gl.clearColor(0, 0, 0, 1);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    const shader = new Shader(gl, vertex_source, fragment_source);
    shader.useProgram();

    // cube VAO
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const posVbo = gl.createBuffer();
    const posLocation = gl.getAttribLocation(shader.program, "a_pos");
    gl.bindBuffer(gl.ARRAY_BUFFER, posVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 3, gl.FLOAT, false, 0, 0);

    const colorVbo = gl.createBuffer();
    const colorLocation = gl.getAttribLocation(shader.program, "a_color");
    gl.bindBuffer(gl.ARRAY_BUFFER, colorVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getColor()), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    const model = mat4.create();

    shader.setMat4("model", model);

    const cameraPosition: vec3 = [0, 0, 3];
    const camera = new Camera(cameraPosition, [0, 1, 0]);
    camera.mouseSensitivity = 0.04;
    var deltaTime = 0.01;
    var lastFrame = 0;
    const drawScene = (time: number) => {
        resizeCanvas(gl);
        const currentFrame = time;
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindVertexArray(vao);

        const projection = mat4.perspective(mat4.create(), glMatrix.toRadian(camera.zoom), gl.canvas.width / gl.canvas.height, 0.1, 100);
        shader.setMat4("projection", projection);

        const view = camera.getViewMatrix();
        shader.setMat4("view", view);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        requestAnimationFrame(drawScene);
    };

    window.addEventListener("keydown", (event: KeyboardEvent) => {
        switch (event.key) {
            case "w":
                camera.processKeyboard(Camera_Movement.FORWARD, deltaTime * 0.001);
                break;
            case "s":
                camera.processKeyboard(Camera_Movement.BACKWARD, deltaTime * 0.001);
                break;
            case "a":
                camera.processKeyboard(Camera_Movement.LEFT, deltaTime * 0.001);
                break;
            case "d":
                camera.processKeyboard(Camera_Movement.RIGHT, deltaTime * 0.001);
                break;
            default:
                break;
        }
    });

    window.addEventListener("wheel", (event: WheelEvent) => {
        camera.processMouseScroll(event.deltaY * 0.01);
    });

    window.addEventListener("mousemove", (event: MouseEvent) => {
        camera.processMouseMovement(event.movementX, event.movementY);
    });

    requestAnimationFrame(drawScene);
};

export default draw;
