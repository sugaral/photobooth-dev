"use strict";

/**
 * Commercial 60FPS WebGL Real-Time Beauty Engine for Photobooth
 * Performs continuous GPU coordinate warping (Eye Enlargement & V-Line Slimming)
 * and bilateral skin smoothing with YCrCb tone preservation. Zero seams, zero tearing.
 */
(function (window) {
  'use strict';

  var gl = null;
  var canvasEl = null;
  var program = null;
  var texture = null;
  var uniforms = {};
  var isInitialized = false;
  var vsSource = "\n        attribute vec2 a_position;\n        attribute vec2 a_texCoord;\n        varying vec2 v_texCoord;\n        void main() {\n            gl_Position = vec4(a_position, 0.0, 1.0);\n            v_texCoord = a_texCoord;\n        }\n    ";
  var fsSource = [
    'precision mediump float;',
    'uniform sampler2D u_image;',
    'uniform vec2 u_resolution;',
    'uniform vec2 u_eye_left;',
    'uniform vec2 u_eye_right;',
    'uniform float u_eye_radius;',
    'uniform float u_eye_strength;',
    'uniform vec2 u_jaw_left;',
    'uniform vec2 u_jaw_right;',
    'uniform float u_jaw_radius;',
    'uniform float u_jaw_shift;',
    'uniform vec2 u_chin;',
    'uniform float u_chin_radius;',
    'uniform float u_chin_shift;',
    'uniform vec2 u_face_center;',
    'uniform vec2 u_face_size;',
    'uniform float u_smooth;',
    'uniform float u_white;',
    'uniform float u_rosy;',
    'uniform float u_clarity;',
    '',
    'varying vec2 v_texCoord;',
    '',
    'void main() {',
    '    vec2 uv = v_texCoord;',
    '    float aspect = u_resolution.x / max(1.0, u_resolution.y);',
    '    ',
    '    // 1. Natural Eye Enlargement (Radial continuous expansion, zero seam at r = R)',
    '    if (u_eye_strength > 0.0) {',
    '        vec2 dl = uv - u_eye_left;',
    '        float dist_l = length(vec2(dl.x, dl.y * (1.0 / aspect)));',
    '        if (dist_l < u_eye_radius) {',
    '            float f = 1.0 - u_eye_strength * pow(1.0 - dist_l / u_eye_radius, 1.6);',
    '            uv = u_eye_left + dl * f;',
    '        }',
    '        vec2 dr = uv - u_eye_right;',
    '        float dist_r = length(vec2(dr.x, dr.y * (1.0 / aspect)));',
    '        if (dist_r < u_eye_radius) {',
    '            float f = 1.0 - u_eye_strength * pow(1.0 - dist_r / u_eye_radius, 1.6);',
    '            uv = u_eye_right + dr * f;',
    '        }',
    '    }',
    '    ',
    '    // 2. V-Line Jaw Slimming (C2 continuous polynomial inward pinch)',
    '    if (u_jaw_shift > 0.0) {',
    '        vec2 djl = uv - u_jaw_left;',
    '        float dist_jl = length(vec2(djl.x, djl.y * (1.0 / aspect)));',
    '        if (dist_jl < u_jaw_radius) {',
    '            float f = pow(1.0 - pow(dist_jl / u_jaw_radius, 2.0), 2.0);',
    '            uv.x -= u_jaw_shift * f;',
    '        }',
    '        vec2 djr = uv - u_jaw_right;',
    '        float dist_jr = length(vec2(djr.x, djr.y * (1.0 / aspect)));',
    '        if (dist_jr < u_jaw_radius) {',
    '            float f = pow(1.0 - pow(dist_jr / u_jaw_radius, 2.0), 2.0);',
    '            uv.x += u_jaw_shift * f;',
    '        }',
    '        vec2 dc = uv - u_chin;',
    '        float dist_c = length(vec2(dc.x, dc.y * (1.0 / aspect)));',
    '        if (dist_c < u_chin_radius) {',
    '            float f = pow(1.0 - pow(dist_c / u_chin_radius, 2.0), 2.0);',
    '            uv.y += u_chin_shift * f;',
    '        }',
    '    }',
    '    ',
    '    vec4 baseColor = texture2D(u_image, uv);',
    '    ',
    '    // 3. Bilateral Skin Smoothing, Whole-Face Cold Porcelain Whitening & 3D Stereoscopic Contouring',
    '    if (u_smooth > 0.0 || u_white > 0.0 || u_rosy > 0.0 || u_clarity > 0.0) {',
    '        float r = baseColor.r;',
    '        float g = baseColor.g;',
    '        float b = baseColor.b;',
    '        float cr = 0.5 + 0.5 * r - 0.4187 * g - 0.0813 * b;',
    '        float cb = 0.5 - 0.1687 * r - 0.3313 * g + 0.5 * b;',
    '        ',
    '        // Exclude neutral grays/whites (walls, white clothing, background) via saturation',
    '        float maxC = max(r, max(g, b));',
    '        float minC = min(r, min(g, b));',
    '        float sat = maxC - minC;',
    '        float has_skin_color = smoothstep(0.06, 0.14, sat);',
    '        ',
    '        // Human skin tone boundary in YCrCb',
    '        float is_skin = has_skin_color',
    '                      * smoothstep(0.46, 0.50, cr) * (1.0 - smoothstep(0.70, 0.74, cr))',
    '                      * smoothstep(0.25, 0.30, cb) * (1.0 - smoothstep(0.53, 0.57, cb));',
    '                      ',
    '        // Strictly confine effect to human facial envelope (zero spill onto clothes or background)',
    '        vec2 df = uv - u_face_center;',
    '        float fw = max(0.001, u_face_size.x * 0.90);',
    '        float fh = max(0.001, u_face_size.y * 1.00);',
    '        float norm_x = df.x / fw;',
    '        float norm_y = df.y > 0.0 ? (df.y / (fh * 1.25)) : (df.y / (fh * 1.00));',
    '        float head_dist = length(vec2(norm_x, norm_y));',
    '        float spatial = (1.0 - smoothstep(0.70, 1.05, head_dist));',
    '        float skin_weight = is_skin * spatial;',
    '        ',
    '        // Multi-scale bilateral skin smoothing with crisp micro-pore retention (零朦胧、零白雾、有质感)',
    '        vec3 texturedSkin = baseColor.rgb;',
    '        vec3 high_pass = vec3(0.0);',
    '        if (u_smooth > 0.0 || u_clarity > 0.0) {',
    '            vec2 step = (2.0 + u_smooth * 3.0) / u_resolution;',
    '            vec4 sum = baseColor;',
    '            float w_sum = 1.0;',
    '            ',
    '            // 8-tap concentric Poisson-like sampling (orthogonal inner ring + diagonal outer ring)',
    '            vec4 c0 = texture2D(u_image, uv + vec2( 1.0,  0.0) * step);',
    '            float w0 = exp(-dot(c0.rgb - baseColor.rgb, c0.rgb - baseColor.rgb) * 55.0);',
    '            sum += c0 * w0; w_sum += w0;',
    '            vec4 c1 = texture2D(u_image, uv + vec2(-1.0,  0.0) * step);',
    '            float w1 = exp(-dot(c1.rgb - baseColor.rgb, c1.rgb - baseColor.rgb) * 55.0);',
    '            sum += c1 * w1; w_sum += w1;',
    '            vec4 c2 = texture2D(u_image, uv + vec2( 0.0,  1.0) * step);',
    '            float w2 = exp(-dot(c2.rgb - baseColor.rgb, c2.rgb - baseColor.rgb) * 55.0);',
    '            sum += c2 * w2; w_sum += w2;',
    '            vec4 c3 = texture2D(u_image, uv + vec2( 0.0, -1.0) * step);',
    '            float w3 = exp(-dot(c3.rgb - baseColor.rgb, c3.rgb - baseColor.rgb) * 55.0);',
    '            sum += c3 * w3; w_sum += w3;',
    '            vec4 c4 = texture2D(u_image, uv + vec2( 1.7,  1.7) * step);',
    '            float w4 = exp(-dot(c4.rgb - baseColor.rgb, c4.rgb - baseColor.rgb) * 55.0) * 0.75;',
    '            sum += c4 * w4; w_sum += w4;',
    '            vec4 c5 = texture2D(u_image, uv + vec2(-1.7,  1.7) * step);',
    '            float w5 = exp(-dot(c5.rgb - baseColor.rgb, c5.rgb - baseColor.rgb) * 55.0) * 0.75;',
    '            sum += c5 * w5; w_sum += w5;',
    '            vec4 c6 = texture2D(u_image, uv + vec2( 1.7, -1.7) * step);',
    '            float w6 = exp(-dot(c6.rgb - baseColor.rgb, c6.rgb - baseColor.rgb) * 55.0) * 0.75;',
    '            sum += c6 * w6; w_sum += w6;',
    '            vec4 c7 = texture2D(u_image, uv + vec2(-1.7, -1.7) * step);',
    '            float w7 = exp(-dot(c7.rgb - baseColor.rgb, c7.rgb - baseColor.rgb) * 55.0) * 0.75;',
    '            sum += c7 * w7; w_sum += w7;',
    '            ',
    '            vec3 smoothColor = sum.rgb / max(0.0001, w_sum);',
    '            high_pass = baseColor.rgb - smoothColor;',
    '            ',
    '            // Dual-band detail reconstruction: separate micro-pores from coarse blemishes',
    '            vec3 fine_pores = clamp(high_pass, -0.025, 0.025);',
    '            vec3 coarse_bumps = high_pass - fine_pores;',
    '            ',
    '            // High-end pore texture retention: 12%~35% micro pores so skin breathes naturally',
    '            float fine_weight = mix(0.35, 0.12, u_smooth);',
    '            float coarse_weight = mix(0.10, 0.00, u_smooth);',
    '            vec3 smoothed = smoothColor + fine_pores * fine_weight + coarse_bumps * coarse_weight;',
    '            texturedSkin = mix(baseColor.rgb, smoothed, u_smooth);',
    '        }',
    '        ',
    '        // Genuine De-Yellowing & Porcelain Whitening (去黄退黄气，黄脸变白皙冷白皮，绝不大面积曝光提亮)',
    '        vec3 toned = texturedSkin;',
    '        if (u_white > 0.0 || u_rosy > 0.0) {',
    '            // 1. Detect yellow excess: in Asian skin, R and G dominate while B is deficient',
    '            float yellow_cast = max(0.0, min(texturedSkin.r, texturedSkin.g) - texturedSkin.b);',
    '            ',
    '            // 2. Targeted De-Yellowing: raise B channel to neutralize sallow yellow into pure porcelain white',
    '            float deyellow = u_white * 0.95;',
    '            toned.b += yellow_cast * deyellow;',
    '            // Soften green yellow/olive cast towards clean mid-level',
    '            toned.g = mix(toned.g, (toned.r + toned.b) * 0.50, deyellow * 0.28);',
    '            ',
    '            // 3. Contrast-Preserving Translucent Midtone Lift (微调中段明度，乘法曲线杜绝白雾发蒙与过曝)',
    '            float lum = dot(texturedSkin, vec3(0.299, 0.587, 0.114));',
    '            float bell = sin(clamp(lum, 0.0, 1.0) * 3.14159265);',
    '            toned *= (1.0 + vec3(0.04, 0.06, 0.09) * (u_white * bell));',
    '            ',
    '            // 4. Rosy Bloom (白里透红，防惨白/防假白)',
    '            toned.r += (u_white * 0.02 + u_rosy * 0.08) * bell;',
    '        }',
    '        ',
    '        float effect_strength = clamp(max(u_smooth, max(u_white, u_rosy)) * 1.1, 0.0, 1.0);',
    '        float blend_factor = skin_weight * effect_strength;',
    '        vec3 finalRgb = mix(baseColor.rgb, clamp(toned, 0.0, 1.0), blend_factor);',
    '        ',
    '        // 4. Stereo 3D Contouring & Clarity (立体修容)',
    '        if (u_clarity > 0.0) {',
    '            finalRgb += high_pass * (u_clarity * 1.25) * spatial;',
    '            ',
    '            // T-Zone 3D Specular Highlight (nose bridge and forehead)',
    '            float t_x = abs(df.x) / max(0.001, fw * 0.28);',
    '            float t_y = df.y / max(0.001, fh * 0.70);',
    '            float t_zone = (1.0 - smoothstep(0.0, 1.0, t_x)) * smoothstep(-1.1, -0.1, t_y) * (1.0 - smoothstep(0.2, 0.7, t_y));',
    '            ',
    '            // Lateral Cheek & Jaw Contouring (sculpted V-line shading)',
    '            float contour_x = smoothstep(0.48, 0.95, abs(df.x) / max(0.001, fw * 0.85));',
    '            float contour = contour_x * spatial * is_skin;',
    '            ',
    '            finalRgb += vec3(0.07, 0.06, 0.05) * (t_zone * u_clarity * is_skin);',
    '            finalRgb = mix(finalRgb, finalRgb * 0.84, contour * u_clarity * 0.65);',
    '        }',
    '        ',
    '        gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), baseColor.a);',
    '    } else {',
    '        gl_FragColor = baseColor;',
    '    }',
    '}'
  ].join('\n');
  function compileShader(glCtx, type, src) {
    var shader = glCtx.createShader(type);
    glCtx.shaderSource(shader, src);
    glCtx.compileShader(shader);
    if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
      console.error('Shader compile error:', glCtx.getShaderInfoLog(shader));
      glCtx.deleteShader(shader);
      return null;
    }
    return shader;
  }
  function init(canvas) {
    if (!canvas) return false;
    canvasEl = canvas;
    try {
      gl = canvas.getContext('webgl', {
        preserveDrawingBuffer: true,
        alpha: false,
        antialias: false
      });
      if (!gl) {
        console.warn('WebGL not available on canvas');
        return false;
      }
      var vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
      var fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return false;
      program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return false;
      }
      gl.useProgram(program);

      // Quad positions
      var posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      var aPos = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      // Texcoords (top-to-bottom matching MediaPipe landmarks)
      var texBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]), gl.STATIC_DRAW);
      var aTex = gl.getAttribLocation(program, 'a_texCoord');
      gl.enableVertexAttribArray(aTex);
      gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

      // Texture
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Uniform locations
      uniforms = {
        u_image: gl.getUniformLocation(program, 'u_image'),
        u_resolution: gl.getUniformLocation(program, 'u_resolution'),
        u_eye_left: gl.getUniformLocation(program, 'u_eye_left'),
        u_eye_right: gl.getUniformLocation(program, 'u_eye_right'),
        u_eye_radius: gl.getUniformLocation(program, 'u_eye_radius'),
        u_eye_strength: gl.getUniformLocation(program, 'u_eye_strength'),
        u_jaw_left: gl.getUniformLocation(program, 'u_jaw_left'),
        u_jaw_right: gl.getUniformLocation(program, 'u_jaw_right'),
        u_jaw_radius: gl.getUniformLocation(program, 'u_jaw_radius'),
        u_jaw_shift: gl.getUniformLocation(program, 'u_jaw_shift'),
        u_chin: gl.getUniformLocation(program, 'u_chin'),
        u_chin_radius: gl.getUniformLocation(program, 'u_chin_radius'),
        u_chin_shift: gl.getUniformLocation(program, 'u_chin_shift'),
        u_face_center: gl.getUniformLocation(program, 'u_face_center'),
        u_face_size: gl.getUniformLocation(program, 'u_face_size'),
        u_smooth: gl.getUniformLocation(program, 'u_smooth'),
        u_white: gl.getUniformLocation(program, 'u_white'),
        u_rosy: gl.getUniformLocation(program, 'u_rosy'),
        u_clarity: gl.getUniformLocation(program, 'u_clarity')
      };
      isInitialized = true;
      return true;
    } catch (e) {
      console.error('Failed to init WebGL Beauty Engine:', e);
      return false;
    }
  }
  function render(video, params, face) {
    if (!isInitialized || !gl || !video || !video.videoWidth || !video.videoHeight) {
      return false;
    }
    var width = video.videoWidth;
    var height = video.videoHeight;
    if (canvasEl.width !== width || canvasEl.height !== height) {
      canvasEl.width = width;
      canvasEl.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.useProgram(program);

    // Upload current video frame to GPU texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.uniform1i(uniforms.u_image, 0);
    gl.uniform2f(uniforms.u_resolution, width, height);

    // Slider parameters
    var sNorm = (params.smooth || 0) / 100.0;
    var wNorm = (params.white || 0) / 100.0;
    var rNorm = (params.rosy || 0) / 100.0;
    var cNorm = (params.clarity || 0) / 100.0;
    var eyeNorm = (params.eye || 0) / 100.0;
    var slimNorm = (params.slim || 0) / 100.0;
    gl.uniform1f(uniforms.u_smooth, sNorm);
    gl.uniform1f(uniforms.u_white, wNorm);
    gl.uniform1f(uniforms.u_rosy, rNorm);
    gl.uniform1f(uniforms.u_clarity, cNorm);
    if (face && face.bounds && face.bounds.center) {
      var cx = face.bounds.center[0];
      var cy = face.bounds.center[1];
      var fw = face.bounds.size[0];
      var fh = face.bounds.size[1];
      gl.uniform2f(uniforms.u_face_center, cx, cy);
      gl.uniform2f(uniforms.u_face_size, fw, fh);

      // Eye deformation
      if (face.eyes && face.eyes.left && face.eyes.right && eyeNorm > 0.0) {
        gl.uniform2f(uniforms.u_eye_left, face.eyes.left.center[0], face.eyes.left.center[1]);
        gl.uniform2f(uniforms.u_eye_right, face.eyes.right.center[0], face.eyes.right.center[1]);
        var eyeR = Math.max(0.055, (face.eyes.left.width || 0.05) * 1.65);
        gl.uniform1f(uniforms.u_eye_radius, eyeR);
        gl.uniform1f(uniforms.u_eye_strength, eyeNorm * 0.45);
      } else {
        gl.uniform1f(uniforms.u_eye_strength, 0.0);
      }

      // Jaw V-line slimming
      if (slimNorm > 0.0) {
        var jLeft = face.jaw ? face.jaw.left : [cx - fw * 0.32, cy + fh * 0.20];
        var jRight = face.jaw ? face.jaw.right : [cx + fw * 0.32, cy + fh * 0.20];
        var chinPt = face.jaw ? face.jaw.chin : [cx, cy + fh * 0.44];
        gl.uniform2f(uniforms.u_jaw_left, jLeft[0], jLeft[1]);
        gl.uniform2f(uniforms.u_jaw_right, jRight[0], jRight[1]);
        gl.uniform1f(uniforms.u_jaw_radius, fw * 0.45);
        gl.uniform1f(uniforms.u_jaw_shift, slimNorm * (fw * 0.090));
        gl.uniform2f(uniforms.u_chin, chinPt[0], chinPt[1]);
        gl.uniform1f(uniforms.u_chin_radius, fw * 0.30);
        gl.uniform1f(uniforms.u_chin_shift, slimNorm * (fh * 0.035));
      } else {
        gl.uniform1f(uniforms.u_jaw_shift, 0.0);
        gl.uniform1f(uniforms.u_chin_shift, 0.0);
      }
    } else {
      gl.uniform1f(uniforms.u_eye_strength, 0.0);
      gl.uniform1f(uniforms.u_jaw_shift, 0.0);
      gl.uniform1f(uniforms.u_chin_shift, 0.0);
      gl.uniform2f(uniforms.u_face_center, 0.5, 0.5);
      gl.uniform2f(uniforms.u_face_size, 0.75, 0.85);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    return true;
  }
  function stop() {
    if (canvasEl && gl) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }
  window.beautyGl = {
    init: init,
    render: render,
    stop: stop,
    isSupported: function isSupported() {
      try {
        var test = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && test.getContext('webgl'));
      } catch (e) {
        return false;
      }
    }
  };
})(window);