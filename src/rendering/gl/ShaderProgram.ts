import {vec2, vec4, mat4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';
import Texture from './Texture';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number; // This time, it's an instanced rendering attribute, so each particle can have a unique color. Not per-vertex, but per-instance.
  attrTranslate: number; // Used in the vertex shader during instanced rendering to offset the vertex positions to the particle's drawn position.
  attrParticleTranslate: number;
  attrInstanceIdx: number;  // used in instanced rendering to determine the idex of bins
  attrScaleFactor: number;



  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifCameraAxes: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifDimensions: WebGLUniformLocation;
  unifTotalBins: WebGLUniformLocation;
  unifRad: WebGLUniformLocation;
  unifFreq: WebGLUniformLocation;

  unifTexUnits: Map<string, WebGLUniformLocation>;


  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrTranslate = gl.getAttribLocation(this.prog, "vs_Translate");
    this.attrParticleTranslate = gl.getAttribLocation(this.prog, "vs_ParticleTranslate");
    this.attrInstanceIdx = gl.getAttribLocation(this.prog, "vs_InstanceIdx");
    this.attrScaleFactor = gl.getAttribLocation(this.prog, "vs_ScaleFactor");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifCameraAxes      = gl.getUniformLocation(this.prog, "u_CameraAxes");
    this.unifTime      = gl.getUniformLocation(this.prog, "u_Time");
    this.unifDimensions   = gl.getUniformLocation(this.prog, "u_Dimensions");
    this.unifTotalBins   = gl.getUniformLocation(this.prog, "u_TotalBins");
    this.unifRad   = gl.getUniformLocation(this.prog, "u_Rad");
    this.unifFreq   = gl.getUniformLocation(this.prog, "u_Freq");
 
    this.unifTexUnits = new Map<string, WebGLUniformLocation>();
  }

  setupTexUnits(handleNames: Array<string>) {
    for (let handle of handleNames) {
      var location = gl.getUniformLocation(this.prog, handle);
      if (location !== -1) {
        this.unifTexUnits.set(handle, location);
      } else {
        console.log("Could not find handle for texture named: \'" + handle + "\'!");
      }
    }
  }

   // Bind the given Texture to the given texture unit
   bindTexToUnit(handleName: string, tex: Texture, unit: number) {
    this.use();
    var location = this.unifTexUnits.get(handleName);
    if (location !== undefined) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      tex.bindTex();
      gl.uniform1i(location, unit);
    } else {
      console.log("Texture with handle name: \'" + handleName + "\' was not found");
    }
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setCameraAxes(axes: mat3) {
    this.use();
    if (this.unifCameraAxes !== -1) {
      gl.uniformMatrix3fv(this.unifCameraAxes, false, axes);
    }
  }

  setTime(t: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  setDimension(dimensions: vec2) {
    this.use();

    if(this.unifDimensions != -1)
    {
      gl.uniform2fv(this.unifDimensions, dimensions);
    }
  }

  setTotalBins(totalBins: number) {
    this.use();

    if(this.unifTotalBins != -1)
    {
      gl.uniform1f(this.unifTotalBins, totalBins);
    }
  }

  setRad(rad: number) {
    this.use();

    if(this.unifRad != -1)
    {
      gl.uniform1f(this.unifRad, rad);
    }
  }

  setFreq(freq: number) {
    this.use();

    if(this.unifFreq != -1)
    {
      gl.uniform1f(this.unifFreq, freq);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrNor, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrCol != -1 && d.bindCol()) {
      gl.enableVertexAttribArray(this.attrCol);
      gl.vertexAttribPointer(this.attrCol, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrCol, 1); // Advance 1 index in col VBO for each drawn instance
    }

    if (this.attrParticleTranslate != -1 && d.bindParticleTranslate()) {
      gl.enableVertexAttribArray(this.attrParticleTranslate);
      gl.vertexAttribPointer(this.attrParticleTranslate, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrParticleTranslate, 1); // Advance 3 index in translate VBO for each drawn instance
    }

    if (this.attrTranslate != -1 && d.bindTranslate()) {
      gl.enableVertexAttribArray(this.attrTranslate);
      gl.vertexAttribPointer(this.attrTranslate, 1, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTranslate, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrInstanceIdx != -1 && d.bindInstanceIdx()) {
      gl.enableVertexAttribArray(this.attrInstanceIdx);
      gl.vertexAttribPointer(this.attrInstanceIdx, 1, gl.FLOAT, false, 0, 0);  // ???????????/gl_FLOAT???????????????
      gl.vertexAttribDivisor(this.attrInstanceIdx, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrScaleFactor != -1 && d.bindScaleFactor()) {
      gl.enableVertexAttribArray(this.attrScaleFactor);
      gl.vertexAttribPointer(this.attrScaleFactor, 1, gl.FLOAT, false, 0, 0);  // ???????????/gl_FLOAT???????????????
      gl.vertexAttribDivisor(this.attrScaleFactor, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    d.bindIdx();
    if (d.numInstances > 0) {
      gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);
    } else {
      gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);
    }
   

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrTranslate != -1) gl.disableVertexAttribArray(this.attrTranslate);
    if (this.attrParticleTranslate != -1) gl.disableVertexAttribArray(this.attrParticleTranslate);
    if (this.attrInstanceIdx != -1) gl.disableVertexAttribArray(this.attrInstanceIdx);
    if (this.attrScaleFactor != -1) gl.disableVertexAttribArray(this.attrScaleFactor);
  }
};

export default ShaderProgram;
