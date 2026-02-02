"use strict";

var _internalTexture = require("../../Materials/Textures/internalTexture");
var _logger = require("../../Misc/logger");
var _thinEngine = require("../thinEngine");
var _webGLRenderTargetWrapper = require("../WebGL/webGLRenderTargetWrapper");
var _textureHelper = require("core/Materials/Textures/textureHelper.functions");
var _constants = require("../constants");
require("../AbstractEngine/abstractEngine.texture");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
_thinEngine.ThinEngine.prototype._createHardwareRenderTargetWrapper = function (isMulti, isCube, size) {
  var rtWrapper = new _webGLRenderTargetWrapper.WebGLRenderTargetWrapper(isMulti, isCube, size, this, this._gl);
  this._renderTargetWrapperCache.push(rtWrapper);
  return rtWrapper;
};
_thinEngine.ThinEngine.prototype.createRenderTargetTexture = function (size, options) {
  var rtWrapper = this._createHardwareRenderTargetWrapper(false, false, size);
  var generateDepthBuffer = true;
  var generateStencilBuffer = false;
  var noColorAttachment = false;
  var colorAttachment = undefined;
  var samples = 1;
  var label = undefined;
  if (options !== undefined && typeof options === "object") {
    var _options$generateDept, _options$samples;
    generateDepthBuffer = (_options$generateDept = options.generateDepthBuffer) !== null && _options$generateDept !== void 0 ? _options$generateDept : true;
    generateStencilBuffer = !!options.generateStencilBuffer;
    noColorAttachment = !!options.noColorAttachment;
    colorAttachment = options.colorAttachment;
    samples = (_options$samples = options.samples) !== null && _options$samples !== void 0 ? _options$samples : 1;
    label = options.label;
  }
  var texture = colorAttachment || (noColorAttachment ? null : this._createInternalTexture(size, options, true, 5 /* InternalTextureSource.RenderTarget */));
  var width = size.width || size;
  var height = size.height || size;
  var currentFrameBuffer = this._currentFramebuffer;
  var gl = this._gl;
  // Create the framebuffer
  var framebuffer = gl.createFramebuffer();
  this._bindUnboundFramebuffer(framebuffer);
  rtWrapper._depthStencilBuffer = this._setupFramebufferDepthAttachments(generateStencilBuffer, generateDepthBuffer, width, height);
  // No need to rebind on every frame
  if (texture && !texture.is2DArray && !texture.is3D) {
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture._hardwareTexture.underlyingResource, 0);
  }
  this._bindUnboundFramebuffer(currentFrameBuffer);
  rtWrapper.label = label !== null && label !== void 0 ? label : "RenderTargetWrapper";
  rtWrapper._framebuffer = framebuffer;
  rtWrapper._generateDepthBuffer = generateDepthBuffer;
  rtWrapper._generateStencilBuffer = generateStencilBuffer;
  rtWrapper.setTextures(texture);
  if (!colorAttachment) {
    this.updateRenderTargetTextureSampleCount(rtWrapper, samples);
  } else {
    rtWrapper._samples = colorAttachment.samples;
    if (colorAttachment.samples > 1) {
      var msaaRenderBuffer = colorAttachment._hardwareTexture.getMSAARenderBuffer(0);
      rtWrapper._MSAAFramebuffer = gl.createFramebuffer();
      this._bindUnboundFramebuffer(rtWrapper._MSAAFramebuffer);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, msaaRenderBuffer);
      this._bindUnboundFramebuffer(null);
    }
  }
  return rtWrapper;
};
_thinEngine.ThinEngine.prototype._createDepthStencilTexture = function (size, options, rtWrapper) {
  var _rtWrapper$_MSAAFrame;
  var gl = this._gl;
  var layers = size.layers || 0;
  var depth = size.depth || 0;
  var target = gl.TEXTURE_2D;
  if (layers !== 0) {
    target = gl.TEXTURE_2D_ARRAY;
  } else if (depth !== 0) {
    target = gl.TEXTURE_3D;
  }
  var internalTexture = new _internalTexture.InternalTexture(this, 12 /* InternalTextureSource.DepthStencil */);
  internalTexture.label = options.label;
  if (!this._caps.depthTextureExtension) {
    _logger.Logger.Error("Depth texture is not supported by your browser or hardware.");
    return internalTexture;
  }
  var internalOptions = _objectSpread({
    bilinearFiltering: false,
    comparisonFunction: 0,
    generateStencil: false
  }, options);
  this._bindTextureDirectly(target, internalTexture, true);
  this._setupDepthStencilTexture(internalTexture, size, internalOptions.comparisonFunction === 0 ? false : internalOptions.bilinearFiltering, internalOptions.comparisonFunction, internalOptions.samples);
  if (internalOptions.depthTextureFormat !== undefined) {
    if (internalOptions.depthTextureFormat !== _constants.Constants.TEXTUREFORMAT_DEPTH16 && internalOptions.depthTextureFormat !== _constants.Constants.TEXTUREFORMAT_DEPTH24 && internalOptions.depthTextureFormat !== _constants.Constants.TEXTUREFORMAT_DEPTH24UNORM_STENCIL8 && internalOptions.depthTextureFormat !== _constants.Constants.TEXTUREFORMAT_DEPTH24_STENCIL8 && internalOptions.depthTextureFormat !== _constants.Constants.TEXTUREFORMAT_DEPTH32_FLOAT && internalOptions.depthTextureFormat !== _constants.Constants.TEXTUREFORMAT_DEPTH32FLOAT_STENCIL8) {
      _logger.Logger.Error("Depth texture ".concat(internalOptions.depthTextureFormat, " format is not supported."));
      return internalTexture;
    }
    internalTexture.format = internalOptions.depthTextureFormat;
  } else {
    internalTexture.format = internalOptions.generateStencil ? _constants.Constants.TEXTUREFORMAT_DEPTH24_STENCIL8 : _constants.Constants.TEXTUREFORMAT_DEPTH24;
  }
  var hasStencil = (0, _textureHelper.HasStencilAspect)(internalTexture.format);
  var type = this._getWebGLTextureTypeFromDepthTextureFormat(internalTexture.format);
  var format = hasStencil ? gl.DEPTH_STENCIL : gl.DEPTH_COMPONENT;
  var internalFormat = this._getInternalFormatFromDepthTextureFormat(internalTexture.format, true, hasStencil);
  if (internalTexture.is2DArray) {
    gl.texImage3D(target, 0, internalFormat, internalTexture.width, internalTexture.height, layers, 0, format, type, null);
  } else if (internalTexture.is3D) {
    gl.texImage3D(target, 0, internalFormat, internalTexture.width, internalTexture.height, depth, 0, format, type, null);
  } else {
    gl.texImage2D(target, 0, internalFormat, internalTexture.width, internalTexture.height, 0, format, type, null);
  }
  this._bindTextureDirectly(target, null);
  this._internalTexturesCache.push(internalTexture);
  if (rtWrapper._depthStencilBuffer) {
    gl.deleteRenderbuffer(rtWrapper._depthStencilBuffer);
    rtWrapper._depthStencilBuffer = null;
  }
  this._bindUnboundFramebuffer((_rtWrapper$_MSAAFrame = rtWrapper._MSAAFramebuffer) !== null && _rtWrapper$_MSAAFrame !== void 0 ? _rtWrapper$_MSAAFrame : rtWrapper._framebuffer);
  rtWrapper._generateStencilBuffer = hasStencil;
  rtWrapper._depthStencilTextureWithStencil = hasStencil;
  rtWrapper._depthStencilBuffer = this._setupFramebufferDepthAttachments(rtWrapper._generateStencilBuffer, rtWrapper._generateDepthBuffer, rtWrapper.width, rtWrapper.height, rtWrapper.samples, internalTexture.format);
  this._bindUnboundFramebuffer(null);
  return internalTexture;
};
_thinEngine.ThinEngine.prototype.updateRenderTargetTextureSampleCount = function (rtWrapper, samples) {
  var _rtWrapper$texture, _rtWrapper$_MSAAFrame2;
  if (this.webGLVersion < 2 || !rtWrapper) {
    return 1;
  }
  if (rtWrapper.samples === samples) {
    return samples;
  }
  var gl = this._gl;
  samples = Math.min(samples, this.getCaps().maxMSAASamples);
  // Dispose previous render buffers
  if (rtWrapper._depthStencilBuffer) {
    gl.deleteRenderbuffer(rtWrapper._depthStencilBuffer);
    rtWrapper._depthStencilBuffer = null;
  }
  if (rtWrapper._MSAAFramebuffer) {
    gl.deleteFramebuffer(rtWrapper._MSAAFramebuffer);
    rtWrapper._MSAAFramebuffer = null;
  }
  var hardwareTexture = (_rtWrapper$texture = rtWrapper.texture) === null || _rtWrapper$texture === void 0 ? void 0 : _rtWrapper$texture._hardwareTexture;
  hardwareTexture === null || hardwareTexture === void 0 || hardwareTexture.releaseMSAARenderBuffers();
  if (rtWrapper.texture && samples > 1 && typeof gl.renderbufferStorageMultisample === "function") {
    var framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
      throw new Error("Unable to create multi sampled framebuffer");
    }
    rtWrapper._MSAAFramebuffer = framebuffer;
    this._bindUnboundFramebuffer(rtWrapper._MSAAFramebuffer);
    var colorRenderbuffer = this._createRenderBuffer(rtWrapper.texture.width, rtWrapper.texture.height, samples, -1 /* not used */, this._getRGBABufferInternalSizedFormat(rtWrapper.texture.type, rtWrapper.texture.format, rtWrapper.texture._useSRGBBuffer), gl.COLOR_ATTACHMENT0, false);
    if (!colorRenderbuffer) {
      throw new Error("Unable to create multi sampled framebuffer");
    }
    hardwareTexture === null || hardwareTexture === void 0 || hardwareTexture.addMSAARenderBuffer(colorRenderbuffer);
  }
  this._bindUnboundFramebuffer((_rtWrapper$_MSAAFrame2 = rtWrapper._MSAAFramebuffer) !== null && _rtWrapper$_MSAAFrame2 !== void 0 ? _rtWrapper$_MSAAFrame2 : rtWrapper._framebuffer);
  if (rtWrapper.texture) {
    rtWrapper.texture.samples = samples;
  }
  rtWrapper._samples = samples;
  var depthFormat = rtWrapper._depthStencilTexture ? rtWrapper._depthStencilTexture.format : undefined;
  rtWrapper._depthStencilBuffer = this._setupFramebufferDepthAttachments(rtWrapper._generateStencilBuffer, rtWrapper._generateDepthBuffer, rtWrapper.width, rtWrapper.height, samples, depthFormat);
  this._bindUnboundFramebuffer(null);
  return samples;
};
_thinEngine.ThinEngine.prototype._setupDepthStencilTexture = function (internalTexture, size, bilinearFiltering, comparisonFunction) {
  var _size$width, _size$height;
  var samples = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var width = (_size$width = size.width) !== null && _size$width !== void 0 ? _size$width : size;
  var height = (_size$height = size.height) !== null && _size$height !== void 0 ? _size$height : size;
  var layers = size.layers || 0;
  var depth = size.depth || 0;
  internalTexture.baseWidth = width;
  internalTexture.baseHeight = height;
  internalTexture.width = width;
  internalTexture.height = height;
  internalTexture.is2DArray = layers > 0;
  internalTexture.depth = layers || depth;
  internalTexture.isReady = true;
  internalTexture.samples = samples;
  internalTexture.generateMipMaps = false;
  internalTexture.samplingMode = bilinearFiltering ? _constants.Constants.TEXTURE_BILINEAR_SAMPLINGMODE : _constants.Constants.TEXTURE_NEAREST_SAMPLINGMODE;
  internalTexture.type = _constants.Constants.TEXTURETYPE_UNSIGNED_BYTE;
  internalTexture._comparisonFunction = comparisonFunction;
  var gl = this._gl;
  var target = this._getTextureTarget(internalTexture);
  var samplingParameters = this._getSamplingParameters(internalTexture.samplingMode, false);
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, samplingParameters.mag);
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, samplingParameters.min);
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // TEXTURE_COMPARE_FUNC/MODE are only availble in WebGL2.
  if (this.webGLVersion > 1) {
    if (comparisonFunction === 0) {
      gl.texParameteri(target, gl.TEXTURE_COMPARE_FUNC, _constants.Constants.LEQUAL);
      gl.texParameteri(target, gl.TEXTURE_COMPARE_MODE, gl.NONE);
    } else {
      gl.texParameteri(target, gl.TEXTURE_COMPARE_FUNC, comparisonFunction);
      gl.texParameteri(target, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    }
  }
};