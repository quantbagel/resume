"use client";

import { useEffect, useRef } from "react";

// This is a port of Pavel Dobryakov's WebGL Fluid Simulation.
// https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
// The code has been adapted to work within a React component
// and has been converted to TypeScript.

const runFluidSimulation = (canvas: HTMLCanvasElement) => {
    let animationFrameId: number;

    const gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported");
        return () => {};
    }

    const config = {
        SIM_RESOLUTION: 64,
        DYE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 0.98,
        VELOCITY_DISSIPATION: 0.99,
        PRESSURE: 0.5,
        PRESSURE_ITERATIONS: 20,
        CURL: 0,
        SPLAT_RADIUS: 0.5,
        SPLAT_FORCE: 2000,
        SHADING: false,
        COLORFUL: false,
        PAUSED: false,
        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: true,
        BLOOM: false,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.8,
        BLOOM_THRESHOLD: 0.6,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: false,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 1.0,
    };

    interface Pointer {
        id: number;
        texcoordX: number;
        texcoordY: number;
        prevTexcoordX: number;
        prevTexcoordY: number;
        deltaX: number;
        deltaY: number;
        down: boolean;
        moved: boolean;
        color: { r: number; g: number; b: number };
    }

    const pointers: Pointer[] = [{
        id: -1,
        texcoordX: 0,
        texcoordY: 0,
        prevTexcoordX: 0,
        prevTexcoordY: 0,
        deltaX: 0,
        deltaY: 0,
        down: false,
        moved: false,
        color: { r: 30, g: 30, b: 30 },
    }];
    
    const getWebGLContext = (canvas: HTMLCanvasElement) => {
        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
        let context = canvas.getContext('webgl', params) as WebGLRenderingContext | null;
        if (context) return context;
        context = canvas.getContext('experimental-webgl', params) as WebGLRenderingContext | null;
        if (context) return context;
        return null;
    }

    const glContext = getWebGLContext(canvas);
    if (!glContext) {
      return () => {};
    }
    const gl_ = glContext;

    const ext = (() => {
        const extensions = ['OES_texture_float', 'OES_texture_half_float', 'OES_texture_float_linear', 'OES_texture_half_float_linear'];
        const result: { [key: string]: any } = {};
        for (const extName of extensions) {
            result[extName] = gl_.getExtension(extName);
        }
        return result;
    })();

    const supportLinearFiltering = ext.OES_texture_float_linear && ext.OES_texture_half_float_linear;
    
    const halfFloat = ext.OES_texture_half_float;
    const halfFloatTexType = halfFloat ? halfFloat.HALF_FLOAT_OES : gl_.UNSIGNED_BYTE;
    const floatTexType = ext.OES_texture_float ? ext.OES_texture_float.FLOAT : halfFloatTexType;

    class GLProgram {
        program: WebGLProgram;
        uniforms: { [key: string]: WebGLUniformLocation | null } = {};

        constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
            this.program = gl_.createProgram()!;
            gl_.attachShader(this.program, vertexShader);
            gl_.attachShader(this.program, fragmentShader);
            gl_.linkProgram(this.program);
            if (!gl_.getProgramParameter(this.program, gl_.LINK_STATUS)) {
                console.error(gl_.getProgramInfoLog(this.program));
            }

            const uniformCount = gl_.getProgramParameter(this.program, gl_.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                const uniform = gl_.getActiveUniform(this.program, i)!;
                this.uniforms[uniform.name] = gl_.getUniformLocation(this.program, uniform.name);
            }
        }

        bind() {
            gl_.useProgram(this.program);
        }
    }

    const compileShader = (type: number, source: string): WebGLShader | null => {
        const shader = gl_.createShader(type)!;
        gl_.shaderSource(shader, source);
        gl_.compileShader(shader);
        if (!gl_.getShaderParameter(shader, gl_.COMPILE_STATUS)) {
            console.error(gl_.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    const baseVertexShader = compileShader(gl_.VERTEX_SHADER, `
        precision highp float;
        attribute vec2 a_position;
        varying vec2 v_texcoord;
        void main () {
            v_texcoord = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `);
    
    const splatShader = compileShader(gl_.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texcoord;
        uniform sampler2D u_target;
        uniform float u_aspectRatio;
        uniform vec3 u_color;
        uniform vec2 u_point;
        uniform float u_radius;
        void main () {
            vec2 p = v_texcoord - u_point.xy;
            p.x *= u_aspectRatio;
            vec3 splat = exp(-dot(p, p) / u_radius) * u_color;
            vec3 base = texture2D(u_target, v_texcoord).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
    `);

    const advectionShader = compileShader(gl_.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texcoord;
        uniform sampler2D u_velocity;
        uniform sampler2D u_source;
        uniform vec2 u_texelSize;
        uniform float u_dt;
        uniform float u_dissipation;
        void main () {
            vec2 coord = v_texcoord - u_dt * texture2D(u_velocity, v_texcoord).xy * u_texelSize;
            gl_FragColor = u_dissipation * texture2D(u_source, coord);
        }
    `);

    const divergenceShader = compileShader(gl_.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texcoord;
        uniform sampler2D u_velocity;
        uniform vec2 u_texelSize;
        void main () {
            float L = texture2D(u_velocity, v_texcoord - vec2(u_texelSize.x, 0.0)).x;
            float R = texture2D(u_velocity, v_texcoord + vec2(u_texelSize.x, 0.0)).x;
            float B = texture2D(u_velocity, v_texcoord - vec2(0.0, u_texelSize.y)).y;
            float T = texture2D(u_velocity, v_texcoord + vec2(0.0, u_texelSize.y)).y;
            vec2 C = texture2D(u_velocity, v_texcoord).xy;
            if (v_texcoord.x < u_texelSize.x) { L = -C.x; }
            if (v_texcoord.x > 1.0 - u_texelSize.x) { R = -C.x; }
            if (v_texcoord.y < u_texelSize.y) { B = -C.y; }
            if (v_texcoord.y > 1.0 - u_texelSize.y) { T = -C.y; }
            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
    `);
    
    const curlShader = compileShader(gl_.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texcoord;
        uniform sampler2D u_velocity;
        uniform vec2 u_texelSize;
        void main () {
            float L = texture2D(u_velocity, v_texcoord - vec2(u_texelSize.x, 0.0)).y;
            float R = texture2D(u_velocity, v_texcoord + vec2(u_texelSize.x, 0.0)).y;
            float B = texture2D(u_velocity, v_texcoord - vec2(0.0, u_texelSize.y)).x;
            float T = texture2D(u_velocity, v_texcoord + vec2(0.0, u_texelSize.y)).x;
            float curl = 0.5 * (R - L - T + B);
            gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);
        }
    `);
    
    const vorticityShader = compileShader(gl_.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texcoord;
        uniform sampler2D u_velocity;
        uniform sampler2D u_curl;
        uniform vec2 u_texelSize;
        uniform float u_dt;
        void main () {
            float L = texture2D(u_curl, v_texcoord - vec2(u_texelSize.x, 0.0)).x;
            float R = texture2D(u_curl, v_texcoord + vec2(u_texelSize.x, 0.0)).x;
            float B = texture2D(u_curl, v_texcoord - vec2(0.0, u_texelSize.y)).x;
            float T = texture2D(u_curl, v_texcoord + vec2(0.0, u_texelSize.y)).x;
            float C = texture2D(u_curl, v_texcoord).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= u_dt * C;
            
            vec2 vel = texture2D(u_velocity, v_texcoord).xy;
            gl_FragColor = vec4(vel + force, 0.0, 1.0);
        }
    `);

    const pressureShader = compileShader(gl_.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texcoord;
        uniform sampler2D u_pressure;
        uniform sampler2D u_divergence;
        uniform vec2 u_texelSize;
        void main () {
            float L = texture2D(u_pressure, v_texcoord - vec2(u_texelSize.x, 0.0)).x;
            float R = texture2D(u_pressure, v_texcoord + vec2(u_texelSize.x, 0.0)).x;
            float B = texture2D(u_pressure, v_texcoord - vec2(0.0, u_texelSize.y)).x;
            float T = texture2D(u_pressure, v_texcoord + vec2(0.0, u_texelSize.y)).x;
            float C = texture2D(u_pressure, v_texcoord).x;
            float div = texture2D(u_divergence, v_texcoord).x;
            float pressure = (L + R + B + T - div) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
    `);
    
    const gradientSubtractShader = compileShader(gl_.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texcoord;
        uniform sampler2D u_pressure;
        uniform sampler2D u_velocity;
        uniform vec2 u_texelSize;
        void main () {
            float L = texture2D(u_pressure, v_texcoord - vec2(u_texelSize.x, 0.0)).x;
            float R = texture2D(u_pressure, v_texcoord + vec2(u_texelSize.x, 0.0)).x;
            float B = texture2D(u_pressure, v_texcoord - vec2(0.0, u_texelSize.y)).x;
            float T = texture2D(u_pressure, v_texcoord + vec2(0.0, u_texelSize.y)).x;
            vec2 vel = texture2D(u_velocity, v_texcoord).xy;
            vel.xy -= 0.5 * vec2(R - L, T - B);
            gl_FragColor = vec4(vel, 0.0, 1.0);
        }
    `);

    const displayShader = compileShader(gl_.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texcoord;
        uniform sampler2D u_texture;
        void main () {
            gl_FragColor = texture2D(u_texture, v_texcoord);
        }
    `);

    const blit = (() => {
        gl_.bindBuffer(gl_.ARRAY_BUFFER, gl_.createBuffer());
        gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl_.STATIC_DRAW);
        gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, gl_.createBuffer());
        gl_.bufferData(gl_.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl_.STATIC_DRAW);
        gl_.vertexAttribPointer(0, 2, gl_.FLOAT, false, 0, 0);
        gl_.enableVertexAttribArray(0);
        return (destination: WebGLFramebuffer | null) => {
            gl_.bindFramebuffer(gl_.FRAMEBUFFER, destination);
            gl_.drawElements(gl_.TRIANGLES, 6, gl_.UNSIGNED_SHORT, 0);
        }
    })();

    let dye: any, velocity: any, divergence: any, curl: any, pressure: any;
    const splatProgram = new GLProgram(baseVertexShader!, splatShader!);
    const advectionProgram = new GLProgram(baseVertexShader!, advectionShader!);
    const divergenceProgram = new GLProgram(baseVertexShader!, divergenceShader!);
    const curlProgram = new GLProgram(baseVertexShader!, curlShader!);
    const vorticityProgram = new GLProgram(baseVertexShader!, vorticityShader!);
    const pressureProgram = new GLProgram(baseVertexShader!, pressureShader!);
    const gradienSubtractProgram = new GLProgram(baseVertexShader!, gradientSubtractShader!);
    const displayProgram = new GLProgram(baseVertexShader!, displayShader!);
    
    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
        gl_.activeTexture(gl_.TEXTURE0);
        let texture = gl_.createTexture();
        gl_.bindTexture(gl_.TEXTURE_2D, texture);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, param);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, param);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_S, gl_.CLAMP_TO_EDGE);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_T, gl_.CLAMP_TO_EDGE);
        gl_.texImage2D(gl_.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    
        let fbo = gl_.createFramebuffer();
        gl_.bindFramebuffer(gl_.FRAMEBUFFER, fbo);
        gl_.framebufferTexture2D(gl_.FRAMEBUFFER, gl_.COLOR_ATTACHMENT0, gl_.TEXTURE_2D, texture, 0);
        gl_.viewport(0, 0, w, h);
        gl_.clear(gl_.COLOR_BUFFER_BIT);
    
        let texelSizeX = 1.0 / w;
        let texelSizeY = 1.0 / h;
    
        return {
            texture,
            fbo,
            width: w,
            height: h,
            texelSizeX,
            texelSizeY,
            attach(id: number) {
                gl_.activeTexture(gl_.TEXTURE0 + id);
                gl_.bindTexture(gl_.TEXTURE_2D, texture);
                return id;
            }
        };
    }

    function initFBOs() {
        let simWidth = Math.floor(canvas.width / config.SIM_RESOLUTION);
        let simHeight = Math.floor(canvas.height / config.SIM_RESOLUTION);
        let dyeWidth = Math.floor(canvas.width / config.DYE_RESOLUTION);
        let dyeHeight = Math.floor(canvas.height / config.DYE_RESOLUTION);

        const texType = halfFloatTexType;
        const rgba = gl_.RGBA;
        const rg = gl_.RGBA;
        const r = gl_.RGBA;
        const filtering = supportLinearFiltering ? gl_.LINEAR : gl_.NEAREST;

        gl_.disable(gl_.BLEND);

        dye = createDoubleFBO(dyeWidth, dyeHeight, rgba, rgba, texType, filtering);
        velocity = createDoubleFBO(simWidth, simHeight, rg, rg, texType, filtering);
        divergence = createFBO(simWidth, simHeight, r, r, texType, gl_.NEAREST);
        curl = createFBO(simWidth, simHeight, r, r, texType, gl_.NEAREST);
        pressure = createDoubleFBO(simWidth, simHeight, r, r, texType, gl_.NEAREST);
    }
    
    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
        let fbo1 = createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(w, h, internalFormat, format, type, param);
    
        return {
            width: w,
            height: h,
            texelSizeX: fbo1.texelSizeX,
            texelSizeY: fbo1.texelSizeY,
            get read() { return fbo1; },
            set read(value) { fbo1 = value; },
            get write() { return fbo2; },
            set write(value) { fbo2 = value; },
            swap() {
                let temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        }
    }

    function resizeCanvas() {
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            initFBOs();
        }
    }
    
    function update() {
        resizeCanvas();
        step(0.016);
        render(null);
        animationFrameId = requestAnimationFrame(update);
    }

    function step(dt: number) {
        gl_.viewport(0, 0, velocity.width, velocity.height);
        advectionProgram.bind();
        gl_.uniform2f(advectionProgram.uniforms.u_texelSize!, velocity.texelSizeX, velocity.texelSizeY);
        gl_.uniform1i(advectionProgram.uniforms.u_velocity!, velocity.read.attach(0));
        gl_.uniform1i(advectionProgram.uniforms.u_source!, velocity.read.attach(0));
        gl_.uniform1f(advectionProgram.uniforms.u_dt!, dt);
        gl_.uniform1f(advectionProgram.uniforms.u_dissipation!, config.VELOCITY_DISSIPATION);
        blit(velocity.write.fbo);
        velocity.swap();
    
        gl_.viewport(0, 0, dye.width, dye.height);
        gl_.uniform1i(advectionProgram.uniforms.u_velocity!, velocity.read.attach(0));
        gl_.uniform1i(advectionProgram.uniforms.u_source!, dye.read.attach(1));
        gl_.uniform1f(advectionProgram.uniforms.u_dissipation!, config.DENSITY_DISSIPATION);
        blit(dye.write.fbo);
        dye.swap();
    
        for(let pointer of pointers){
            if (pointer.moved) {
                splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX, pointer.deltaY, pointer.color);
                pointer.moved = false;
            }
        }
    
        gl_.viewport(0, 0, velocity.width, velocity.height);
        curlProgram.bind();
        gl_.uniform2f(curlProgram.uniforms.u_texelSize!, velocity.texelSizeX, velocity.texelSizeY);
        gl_.uniform1i(curlProgram.uniforms.u_velocity!, velocity.read.attach(0));
        blit(curl.fbo);
        
        vorticityProgram.bind();
        gl_.uniform2f(vorticityProgram.uniforms.u_texelSize!, velocity.texelSizeX, velocity.texelSizeY);
        gl_.uniform1i(vorticityProgram.uniforms.u_velocity!, velocity.read.attach(0));
        gl_.uniform1i(vorticityProgram.uniforms.u_curl!, curl.attach(1));
        gl_.uniform1f(vorticityProgram.uniforms.u_dt!, dt * config.CURL);
        blit(velocity.write.fbo);
        velocity.swap();
    
        divergenceProgram.bind();
        gl_.uniform2f(divergenceProgram.uniforms.u_texelSize!, velocity.texelSizeX, velocity.texelSizeY);
        gl_.uniform1i(divergenceProgram.uniforms.u_velocity!, velocity.read.attach(0));
        blit(divergence.fbo);
    
        gl_.uniform1i(pressureProgram.uniforms.u_divergence!, divergence.attach(1));
        pressureProgram.bind();
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl_.uniform1i(pressureProgram.uniforms.u_pressure!, pressure.read.attach(0));
            blit(pressure.write.fbo);
            pressure.swap();
        }
    
        gradienSubtractProgram.bind();
        gl_.uniform2f(gradienSubtractProgram.uniforms.u_texelSize!, velocity.texelSizeX, velocity.texelSizeY);
        gl_.uniform1i(gradienSubtractProgram.uniforms.u_pressure!, pressure.read.attach(0));
        gl_.uniform1i(gradienSubtractProgram.uniforms.u_velocity!, velocity.read.attach(1));
        blit(velocity.write.fbo);
        velocity.swap();
    }
    
    function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
        gl_.viewport(0, 0, velocity.width, velocity.height);
        splatProgram.bind();
        gl_.uniform1i(splatProgram.uniforms.u_target!, velocity.read.attach(0));
        gl_.uniform1f(splatProgram.uniforms.u_aspectRatio!, canvas.width / canvas.height);
        gl_.uniform2f(splatProgram.uniforms.u_point!, x, y);
        gl_.uniform3f(splatProgram.uniforms.u_color!, dx, dy, 0.0);
        gl_.uniform1f(splatProgram.uniforms.u_radius!, config.SPLAT_RADIUS / 100.0);
        blit(velocity.write.fbo);
        velocity.swap();
    
        gl_.viewport(0, 0, dye.width, dye.height);
        gl_.uniform1i(splatProgram.uniforms.u_target!, dye.read.attach(0));
        gl_.uniform3f(splatProgram.uniforms.u_color!, color.r, color.g, color.b);
        blit(dye.write.fbo);
        dye.swap();
    }
    

    function render (target: WebGLFramebuffer | null) {
        if (config.TRANSPARENT) {
            gl_.disable(gl_.BLEND);
        } else {
            gl_.blendFunc(gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
            gl_.enable(gl_.BLEND);
        }

        const width = target ? target.width : canvas.width;
        const height = target ? target.height : canvas.height;
    
        gl_.viewport(0, 0, width, height);
    
        displayProgram.bind();
        gl_.uniform1i(displayProgram.uniforms.u_texture!, dye.read.attach(0));
        blit(target as any);
    }
    

    const mouseMove = (e: MouseEvent) => {
        const pointer = pointers[0];
        if (!pointer.down) return;
        const rect = canvas.getBoundingClientRect();
        pointer.moved = true;
        let x = e.clientX, y = e.clientY;
        const newTexcoordX = (x - rect.left) / rect.width;
        const newTexcoordY = 1.0 - (y - rect.top) / rect.height;
        pointer.deltaX = (newTexcoordX - pointer.texcoordX) * config.SPLAT_FORCE;
        pointer.deltaY = (newTexcoordY - pointer.texcoordY) * config.SPLAT_FORCE;
        pointer.texcoordX = newTexcoordX;
        pointer.texcoordY = newTexcoordY;
     };

    const mouseDown = (e: MouseEvent) => {
        const pointer = pointers[0];
        pointer.down = true;
        const rect = canvas.getBoundingClientRect();
        let x = e.clientX, y = e.clientY;
        pointer.texcoordX = (x - rect.left) / rect.width;
        pointer.texcoordY = 1.0 - (y - rect.top) / rect.height;
     };

    const mouseUp = () => {
        pointers[0].down = false;
    }

    const touchStart = (e: TouchEvent) => {
        const pointer = pointers[0];
        pointer.down = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        let x = touch.clientX, y = touch.clientY;
        pointer.texcoordX = (x - rect.left) / rect.width;
        pointer.texcoordY = 1.0 - (y - rect.top) / rect.height;
    }
    
    const touchMove = (e: TouchEvent) => {
        e.preventDefault();
        const pointer = pointers[0];
        const touch = e.touches[0];
        pointer.moved = true;
        const rect = canvas.getBoundingClientRect();
        let x = touch.clientX, y = touch.clientY;
        const newTexcoordX = (x - rect.left) / rect.width;
        const newTexcoordY = 1.0 - (y - rect.top) / rect.height;
        pointer.deltaX = (newTexcoordX - pointer.texcoordX) * config.SPLAT_FORCE;
        pointer.deltaY = (newTexcoordY - pointer.texcoordY) * config.SPLAT_FORCE;
        pointer.texcoordX = newTexcoordX;
        pointer.texcoordY = newTexcoordY;
    }
    
    const touchEnd = () => {
        pointers[0].down = false;
    }

    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
    
    window.addEventListener('touchstart', touchStart);
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchEnd);

    initFBOs();
    update();
    
    return () => {
        window.removeEventListener('mousedown', mouseDown);
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup', mouseUp);

        window.removeEventListener('touchstart', touchStart);
        window.removeEventListener('touchmove', touchMove);
        window.removeEventListener('touchend', touchEnd);

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    };
};

const FluidCanvasBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const cleanup = runFluidSimulation(canvas);
        
        return cleanup;
    }, []);

    return (
        <div className="fixed top-0 left-0 -z-[1] pointer-events-none">
            <canvas ref={canvasRef} id="fluid" className="w-screen h-screen" />
        </div>
    );
};

export default FluidCanvasBackground;