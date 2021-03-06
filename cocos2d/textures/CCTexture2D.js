/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var cc = cc = cc || {};

//CONSTANTS:

/** @typedef CCTexture2DPixelFormat
 Possible texture pixel formats
 */
/*
 * Support for RGBA_4_4_4_4 and RGBA_5_5_5_1 was copied from:
 * https://devforums.apple.com/message/37855#37855 by a1studmuffin
 */
cc.kCCTexture2DPixelFormat_Automatic = 0;
//! 32-bit texture: RGBA8888
cc.kCCTexture2DPixelFormat_RGBA8888 = 1;
//! 24-bit texture: RGBA888
cc.kCCTexture2DPixelFormat_RGB888 = 2;
//! 16-bit texture without Alpha channel
cc.kCCTexture2DPixelFormat_RGB565 = 3;
//! 8-bit textures used as masks
cc.kCCTexture2DPixelFormat_A8 = 4;
//! 8-bit intensity texture
cc.kCCTexture2DPixelFormat_I8 = 5;
//! 16-bit textures used as masks
cc.kCCTexture2DPixelFormat_AI88 = 6;
//! 16-bit textures: RGBA4444
cc.kCCTexture2DPixelFormat_RGBA4444 = 7;
//! 16-bit textures: RGB5A1
cc.kCCTexture2DPixelFormat_RGB5A1 = 8;
//! 4-bit PVRTC-compressed texture: PVRTC4
cc.kCCTexture2DPixelFormat_PVRTC4 = 9;
//! 2-bit PVRTC-compressed texture: PVRTC2
cc.kCCTexture2DPixelFormat_PVRTC2 = 10;

//! Default texture format: RGBA8888
cc.kCCTexture2DPixelFormat_Default = cc.kCCTexture2DPixelFormat_RGBA8888,

    // backward compatibility stuff
    cc.kTexture2DPixelFormat_Automatic = cc.kCCTexture2DPixelFormat_Automatic,
    cc.kTexture2DPixelFormat_RGBA8888 = cc.kCCTexture2DPixelFormat_RGBA8888,
    cc.kTexture2DPixelFormat_RGB888 = cc.kCCTexture2DPixelFormat_RGB888,
    cc.kTexture2DPixelFormat_RGB565 = cc.kCCTexture2DPixelFormat_RGB565,
    cc.kTexture2DPixelFormat_A8 = cc.kCCTexture2DPixelFormat_A8,
    cc.kTexture2DPixelFormat_RGBA4444 = cc.kCCTexture2DPixelFormat_RGBA4444,
    cc.kTexture2DPixelFormat_RGB5A1 = cc.kCCTexture2DPixelFormat_RGB5A1,
    cc.kTexture2DPixelFormat_Default = cc.kCCTexture2DPixelFormat_Default

if (cc.FONT_LABEL_SUPPORT) {
//TODO
// FontLabel support
}// CC_FONT_LABEL_SUPPORT

if (cc.ENABLE_CACHE_TEXTTURE_DATA) {
    //TODO include CCTextureCache.h
}

// If the image has alpha, you can create RGBA8 (32-bit) or RGBA4 (16-bit) or RGB5A1 (16-bit)
// Default is: RGBA8888 (32-bit textures)
cc.g_defaultAlphaPixelFormat = cc.kCCTexture2DPixelFormat_Default;
// By default PVR images are treated as if they don't have the alpha channel premultiplied
cc.PVRHaveAlphaPremultiplied_ = false;
/**
 Extension to set the Min / Mag filter
 */

function _ccTexParams(minFilter, magFilter, wrapS, wrapT) {
    this.minFilter = minFilter;
    this.magFilter = magFilter;
    this.wrapS = wrapS;
    this.wrapT = wrapT;
}

//CLASS INTERFACES:

/** @brief cc.Texture2D class.
 * This class allows to easily create OpenGL 2D textures from images, text or raw data.
 * The created cc.Texture2D object will always have power-of-two dimensions.
 * Depending on how you create the cc.Texture2D object, the actual image area of the texture might be smaller than the texture dimensions i.e. "contentSize" != (pixelsWide, pixelsHigh) and (maxS, maxT) != (1.0, 1.0).
 * Be aware that the content of the generated textures will be upside-down!
 */
cc.Texture2D = cc.Class.extend({
    // By default PVR images are treated as if they don't have the alpha channel premultiplied
    _m_bPVRHaveAlphaPremultiplied:null,
    _m_ePixelFormat:null,
    _m_uPixelsWide:null,
    _m_uPixelsHigh:null,
    _m_uName:null,
    _m_tContentSize:null,
    _m_fMaxS:null,
    _m_fMaxT:null,
    _m_bHasPremultipliedAlpha:null,

    /*public:*/
    ctor:function () {
        // implementation CCTexture2D (PVRTC);
        if (cc.SUPPORT_PVRTC) {
            /**
             Extensions to make it easy to create a cc.Texture2D object from a PVRTC file
             Note that the generated textures don't have their alpha premultiplied - use the blending mode (cc.GL_SRC_ALPHA, cc.GL_ONE_MINUS_SRC_ALPHA).
             */
            /** Initializes a texture from a PVRTC buffer */
            this.initWithPVRTCData = function (data, level, bpp, hasAlpha, length, pixelFormat) {
                if (!(cc.Configuration.sharedConfiguration().isSupportsPVRTC())) {
                    cc.LOG("cocos2d: WARNING: PVRTC images is not supported.");
                    return false;
                }

                //TODO
                // glGenTextures(1, this._m_uName);
                //TODO
                // glBindTexture(cc.GL_TEXTURE_2D, this._m_uName);

                this.setAntiAliasTexParameters();

                var format;
                var size = new cc.GLsizei();
                size = length * length * bpp / 8;
                if (hasAlpha) {
                    format = (bpp == 4) ? cc.GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG : cc.GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
                } else {
                    format = (bpp == 4) ? cc.GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG : cc.GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                }
                if (size < 32) {
                    size = 32;
                }
                //TODO
                // glCompressedTexImage2D(cc.GL_TEXTURE_2D, level, format, length, length, 0, size, data);

                this._m_tContentSize = cc.SizeMake(length, length);
                this._m_uPixelsWide = length;
                this._m_uPixelsHigh = length;
                this._m_fMaxS = 1.0;
                this._m_fMaxT = 1.0;
                this._m_bHasPremultipliedAlpha = cc.PVRHaveAlphaPremultiplied_;
                this._m_ePixelFormat = pixelFormat;

                return true;
            };
        }// cc.SUPPORT_PVRTC
    },
    /** pixel format of the texture */
    getPixelFormat:function () {
        return this._m_ePixelFormat;
    },
    //** width in pixels *//
    getPixelsWide:function () {
        return this._m_uPixelsWide;
    },
    //** hight in pixels *//
    getPixelsHigh:function () {
        return this._m_uPixelsHigh;
    },
    //** texture name *//
    getName:function () {
        return this._m_uName;
    },
    //** content size *//
    getContentSizeInPixels:function () {
        var ret = new cc.Size();
        ret.width = this._m_tContentSize.width / cc.CONTENT_SCALE_FACTOR();
        ret.height = this._m_tContentSize.height / cc.CONTENT_SCALE_FACTOR();

        return ret;
    },
    //** texture max S *//
    getMaxS:function () {
        return this._m_fMaxS;
    },
    setMaxS:function (maxS) {
        this._m_fMaxS = maxS;
    },
    //** texture max T *//
    getMaxT:function () {
        return this._m_fMaxT;
    },
    setMaxT:function (maxT) {
        this._m_fMaxT = maxT;
    },
    //** whether or not the texture has their Alpha premultiplied *//
    getHasPremultipliedAlpha:function () {
        return this._m_bHasPremultipliedAlpha;
    },
    description:function () {
        var ret = "<cc.Texture2D | Name = " + this._m_uName + " | Dimensions = " + this._m_uPixelsWide + " x " + this._m_uPixelsHigh
            + " | Coordinates = (" + this._m_fMaxS + ", " + this._m_fMaxT + ")>";
        return ret;
    },
    /** These functions are needed to create mutable textures */
    releaseData:function (data) {
        cc.free(data);
    },
    keepData:function (data, length) {
        cc.UNUSED_PARAM(length);
        //The texture data mustn't be saved becuase it isn't a mutable texture.
        return data;
    },

    /** Intializes with a texture2d with data */
    initWithData:function (pixelFormat, pixelsWide, pixelsHigh, contentSize) {
        //TODO
        // glPixelStorei(cc.GL_UNPACK_ALIGNMENT,1);
        //TODO
        // glGenTextures(1, this._m_uName);
        //TODO
        // glBindTexture(cc.GL_TEXTURE_2D, this._m_uName);

        this.setAntiAliasTexParameters();

        // Specify OpenGL texture image

        switch (pixelFormat) {
            case cc.kCCTexture2DPixelFormat_RGBA8888:
                //TODO
                // glTexImage2D(cc.GL_TEXTURE_2D, 0, cc.GL_RGBA, (GLsizei)pixelsWide, (GLsizei)pixelsHigh, 0, cc.GL_RGBA, cc.GL_UNSIGNED_BYTE, data);
                break;
            case cc.kCCTexture2DPixelFormat_RGB888:
                //TODO
                // glTexImage2D(cc.GL_TEXTURE_2D, 0, cc.GL_RGB, (GLsizei)pixelsWide, (GLsizei)pixelsHigh, 0, cc.GL_RGB, cc.GL_UNSIGNED_BYTE, data);
                break;
            case cc.kCCTexture2DPixelFormat_RGBA4444:
                //TODO
                // glTexImage2D(cc.GL_TEXTURE_2D, 0, cc.GL_RGBA, (GLsizei)pixelsWide, (GLsizei)pixelsHigh, 0, cc.GL_RGBA, cc.GL_UNSIGNED_SHORT_4_4_4_4, data);
                break;
            case cc.kCCTexture2DPixelFormat_RGB5A1:
                //TODO
                // glTexImage2D(cc.GL_TEXTURE_2D, 0, cc.GL_RGBA, (GLsizei)pixelsWide, (GLsizei)pixelsHigh, 0, cc.GL_RGBA, cc.GL_UNSIGNED_SHORT_5_5_5_1, data);
                break;
            case cc.kCCTexture2DPixelFormat_RGB565:
                //TODO
                // glTexImage2D(cc.GL_TEXTURE_2D, 0, cc.GL_RGB, (GLsizei)pixelsWide, (GLsizei)pixelsHigh, 0, cc.GL_RGB, cc.GL_UNSIGNED_SHORT_5_6_5, data);
                break;
            case cc.kCCTexture2DPixelFormat_AI88:
                //TODO
                // glTexImage2D(cc.GL_TEXTURE_2D, 0, cc.GL_LUMINANCE_ALPHA, (GLsizei)pixelsWide, (GLsizei)pixelsHigh, 0, cc.GL_LUMINANCE_ALPHA, cc.GL_UNSIGNED_BYTE, data);
                break;
            case cc.kCCTexture2DPixelFormat_A8:
                //TODO
                // glTexImage2D(cc.GL_TEXTURE_2D, 0, cc.GL_ALPHA, (GLsizei)pixelsWide, (GLsizei)pixelsHigh, 0, cc.GL_ALPHA, cc.GL_UNSIGNED_BYTE, data);
                break;
            default:
                cc.Assert(0, "NSInternalInconsistencyException");

        }

        this._m_tContentSize = contentSize;
        this._m_uPixelsWide = pixelsWide;
        this._m_uPixelsHigh = pixelsHigh;
        this._m_ePixelFormat = pixelFormat;
        this._m_fMaxS = contentSize.width / pixelsWide;
        this._m_fMaxT = contentSize.height / pixelsHigh;

        this._m_bHasPremultipliedAlpha = false;

        return true;
    },

    /**
     Drawing extensions to make it easy to draw basic quads using a CCTexture2D object.
     These functions require cc.GL_TEXTURE_2D and both cc.GL_VERTEX_ARRAY and cc.GL_TEXTURE_COORD_ARRAY client states to be enabled.
     */
    /** draws a texture at a given point */
    drawAtPoint:function (point) {
        var coordinates = [
            0.0, this._m_fMaxT,
            this._m_fMaxS, this._m_fMaxT,
            0.0, 0.0,
            this._m_fMaxS, 0.0 ];

        var width = this._m_uPixelsWide * this._m_fMaxS,
            height = this._m_uPixelsHigh * this._m_fMaxT;

        var vertices = [
            point.x, point.y, 0.0,
            width + point.x, point.y, 0.0,
            point.x, height + point.y, 0.0,
            width + point.x, height + point.y, 0.0 ];

        //TODO
        // glBindTexture(cc.GL_TEXTURE_2D, this._m_uName);
        //TODO
        // glVertexPointer(3, cc.GL_FLOAT, 0, vertices);
        //TODO
        // glTexCoordPointer(2, cc.GL_FLOAT, 0, coordinates);
        //TODO
        // glDrawArrays(cc.GL_TRIANGLE_STRIP, 0, 4);
    },

    /** draws a texture inside a rect */
    drawInRect:function (rect) {
        var coordinates = [
            0.0, this._m_fMaxT,
            this._m_fMaxS, this._m_fMaxT,
            0.0, 0.0,
            this._m_fMaxS, 0.0];

        var vertices = [    rect.origin.x, rect.origin.y, /*0.0,*/
            rect.origin.x + rect.size.width, rect.origin.y, /*0.0,*/
            rect.origin.x, rect.origin.y + rect.size.height, /*0.0,*/
            rect.origin.x + rect.size.width, rect.origin.y + rect.size.height        /*0.0*/ ];

        //TODO
        // glBindTexture(cc.GL_TEXTURE_2D, this._m_uName);
        //TODO
        // glVertexPointer(2, cc.GL_FLOAT, 0, vertices);
        //TODO
        // glTexCoordPointer(2, cc.GL_FLOAT, 0, coordinates);
        //TODO
        // glDrawArrays(cc.GL_TRIANGLE_STRIP, 0, 4);
    },

    /**
     Extensions to make it easy to create a CCTexture2D object from an image file.
     Note that RGBA type textures will have their alpha premultiplied - use the blending mode (cc.GL_ONE, cc.GL_ONE_MINUS_SRC_ALPHA).
     */
    /** Initializes a texture from a UIImage object */
    initWithImage:function (uiImage) {
        var POTWide, POTHigh;

        if (uiImage == null) {
            cc.LOG("cocos2d: cc.Texture2D. Can't create Texture. UIImage is nil");
            return false;
        }

        var conf = cc.Configuration.sharedConfiguration();

        if (cc.TEXTURE_NPOT_SUPPORT) {
            if (conf.isSupportsNPOT()) {
                POTWide = uiImage.getWidth();
                POTHigh = uiImage.getHeight();
            }
        } else {
            POTWide = cc.NextPOT(uiImage.getWidth());
            POTHigh = cc.NextPOT(uiImage.getHeight());
        }


        var maxTextureSize = conf.getMaxTextureSize();
        if (POTHigh > maxTextureSize || POTWide > maxTextureSize) {
            cc.LOG("cocos2d: WARNING: Image (%u x %u) is bigger than the supported %u x %u", POTWide, POTHigh, maxTextureSize, maxTextureSize);
            return null;
        }

        // always load premultiplied images
        return this._initPremultipliedATextureWithImage(uiImage, POTWide, POTHigh);
    },

    /**
     Extensions to make it easy to create a cc.Texture2D object from a string of text.
     Note that the generated textures are of type A8 - use the blending mode (cc.GL_SRC_ALPHA, cc.GL_ONE_MINUS_SRC_ALPHA).
     */
    /** Initializes a texture from a string with dimensions, alignment, font name and font size */
    initWithString:function (text, dimensions, alignment, fontName, fontSize) {
        if (arguments.length == 3) {
            fontName = arguments[1];
            fontSize = arguments[2];
            dimensions = cc.SizeMake(0, 0);
            alignment = cc.TextAlignmentCenter;
        }
        if (cc.ENABLE_CACHE_TEXTTURE_DATA) {
            // cache the texture data
            cc.VolatileTexture.addStringTexture(this, text, dimensions, alignment, fontName, fontSize);
        }
        var image = new cc.Image();
        eAlign = new cc.Image.ETextAlign();
        eAlign = (cc.TextAlignmentCenter == alignment) ? cc.Image.kAlignCenter : (cc.TextAlignmentLeft == alignment) ? cc.Image.kAlignLeft : cc.Image.kAlignRight;

        if (!image.initWithString(text, dimensions.width, dimensions.height, eAlign, fontName, fontSize)) {
            return false;
        }
        return this.initWithImage(image);
    },

    /** Initializes a texture from a PVR file */
    initWithPVRFile:function (file) {
        var bRet = false;
        // nothing to do with cc.Object.init

        var pvr = new cc.TexturePVR;
        bRet = pvr.initWithContentsOfFile(file);

        if (bRet) {
            pvr.setRetainName(true); // don't dealloc texture on release

            this._m_uName = pvr.getName();
            this._m_fMaxS = 1.0;
            this._m_fMaxT = 1.0;
            this._m_uPixelsWide = pvr.getWidth();
            this._m_uPixelsHigh = pvr.getHeight();
            this._m_tContentSize = cc.SizeMake(this._m_uPixelsWide, this._m_uPixelsHigh);
            this._m_bHasPremultipliedAlpha = cc.PVRHaveAlphaPremultiplied_;
            this._m_ePixelFormat = pvr.getFormat();

            this.setAntiAliasTexParameters();
        }
        else {
            cc.LOG("cocos2d: Couldn't load PVR image %s", file);
        }

        return bRet;
    },

    /** sets the min filter, mag filter, wrap s and wrap t texture parameters.
     If the texture size is NPOT (non power of 2), then in can only use cc.GL_CLAMP_TO_EDGE in cc.GL_TEXTURE_WRAP_{S,T}.
     @since v0.8
     */
    setTexParameters:function (texParams) {
        cc.Assert((this._m_uPixelsWide == cc.NextPOT(this._m_uPixelsWide) && this._m_uPixelsHigh == cc.NextPOT(this._m_uPixelsHigh)) ||
            (texParams.wrapS == cc.GL_CLAMP_TO_EDGE && texParams.wrapT == cc.GL_CLAMP_TO_EDGE),
            "cc.GL_CLAMP_TO_EDGE should be used in NPOT textures");
        //TODO
        // BindTexture( cc.GL_TEXTURE_2D, this.this._m_uName );
        //TODO
        // glTexParameteri(cc.GL_TEXTURE_2D, cc.GL_TEXTURE_MIN_FILTER, texParams.minFilter );
        //TODO
        // glTexParameteri(cc.GL_TEXTURE_2D, cc.GL_TEXTURE_MAG_FILTER, texParams.magFilter );
        //TODO
        // glTexParameteri( cc.GL_TEXTURE_2D, cc.GL_TEXTURE_WRAP_S, texParams.wrapS );
        //TODO
        // glTexParameteri( cc.GL_TEXTURE_2D, cc.GL_TEXTURE_WRAP_T, texParams.wrapT );
    },

    /** sets antialias texture parameters:
     - cc.GL_TEXTURE_MIN_FILTER = cc.GL_LINEAR
     - cc.GL_TEXTURE_MAG_FILTER = cc.GL_LINEAR

     @since v0.8
     */
    setAntiAliasTexParameters:function () {
        var texParams = [ cc.GL_LINEAR, cc.GL_LINEAR, cc.GL_CLAMP_TO_EDGE, cc.GL_CLAMP_TO_EDGE ];
        this.setTexParameters(texParams);
    },

    /** sets alias texture parameters:
     - cc.GL_TEXTURE_MIN_FILTER = cc.GL_NEAREST
     - cc.GL_TEXTURE_MAG_FILTER = cc.GL_NEAREST

     @since v0.8
     */
    setAliasTexParameters:function () {
        var texParams = [ cc.GL_NEAREST, cc.GL_NEAREST, cc.GL_CLAMP_TO_EDGE, cc.GL_CLAMP_TO_EDGE ];
        this.setTexParameters(texParams);
    },


    /** Generates mipmap images for the texture.
     It only works if the texture size is POT (power of 2).
     @since v0.99.0
     */
    generateMipmap:function () {
        cc.Assert(this._m_uPixelsWide == cc.NextPOT(this._m_uPixelsWide) && this._m_uPixelsHigh == cc.NextPOT(this._m_uPixelsHigh), "Mimpap texture only works in POT textures");
        //TODO
        // glBindTexture( cc.GL_TEXTURE_2D, this.this._m_uName );
        //cc.glGenerateMipmap(cc.GL_TEXTURE_2D);
    },

    /** returns the bits-per-pixel of the in-memory OpenGL texture
     @since v1.0
     */
    bitsPerPixelForFormat:function () {
        var ret = 0;

        switch (this._m_ePixelFormat) {
            case cc.kCCTexture2DPixelFormat_RGBA8888:
                ret = 32;
                break;
            case cc.kCCTexture2DPixelFormat_RGB565:
                ret = 16;
                break;
            case cc.kCCTexture2DPixelFormat_A8:
                ret = 8;
                break;
            case cc.kCCTexture2DPixelFormat_RGBA4444:
                ret = 16;
                break;
            case cc.kCCTexture2DPixelFormat_RGB5A1:
                ret = 16;
                break;
            case cc.kCCTexture2DPixelFormat_PVRTC4:
                ret = 4;
                break;
            case cc.kCCTexture2DPixelFormat_PVRTC2:
                ret = 2;
                break;
            case cc.kCCTexture2DPixelFormat_I8:
                ret = 8;
                break;
            case cc.kCCTexture2DPixelFormat_AI88:
                ret = 16;
                break;
            case cc.kCCTexture2DPixelFormat_RGB888:
                ret = 24;
                break;
            default:
                ret = -1;
                cc.Assert(false, "illegal pixel format");
                cc.LOG("bitsPerPixelForFormat: %d, cannot give useful result", this._m_ePixelFormat);
                break;
        }
        return ret;
    },


    /*private:*/
    _initPremultipliedATextureWithImage:function (image, POTWide, POTHigh) {
        var data = null;
        var tempData = null;
        var inPixel32 = null;
        var outPixel16 = null;
        var hasAlpha;
        var imageSize = new cc.Size();
        var pixelFormat = new cc.Texture2DPixelFormat();
        var bpp = new cc.size_t();
        hasAlpha = image.hasAlpha();
        bpp = image.getBitsPerComponent();

        // compute pixel format
        if (hasAlpha) {
            pixelFormat = cc.g_defaultAlphaPixelFormat;
        }
        else {
            if (bpp >= 8) {
                pixelFormat = cc.kCCTexture2DPixelFormat_RGB888;
            }
            else {
                cc.LOG("cocos2d: cc.Texture2D: Using RGB565 texture since image has no alpha");
                pixelFormat = cc.kCCTexture2DPixelFormat_RGB565;
            }
        }


        imageSize = cc.SizeMake(image.getWidth(), image.getHeight());

        switch (pixelFormat) {
            case cc.kCCTexture2DPixelFormat_RGBA8888:
            case cc.kCCTexture2DPixelFormat_RGBA4444:
            case cc.kCCTexture2DPixelFormat_RGB5A1:
            case cc.kCCTexture2DPixelFormat_RGB565:
            case cc.kCCTexture2DPixelFormat_A8:
                tempData = image.getData();
                cc.Assert(tempData != null, "null image data.");

                if (image.getWidth() == POTWide && image.getHeight() == POTHigh) {
                    data = new (POTHigh * POTWide * 4);
                    cc.memcpy(data, tempData, POTHigh * POTWide * 4);
                }
                else {
                    data = new (POTHigh * POTWide * 4);

                    var pPixelData = tempData;
                    var pTargetData = data;

                    var imageHeight = image.getHeight();
                    for (var y = 0; y < imageHeight; ++y) {
                        cc.memcpy(pTargetData + POTWide * 4 * y, pPixelData + (image.getWidth()) * 4 * y, (image.getWidth()) * 4);
                    }
                }

                break;
            case cc.kCCTexture2DPixelFormat_RGB888:
                tempData = image.getData();
                cc.Assert(tempData != null, "null image data.");
                if (image.getWidth() == POTWide && image.getHeight() == POTHigh) {
                    data = new (POTHigh * POTWide * 3);
                    cc.memcpy(data, tempData, POTHigh * POTWide * 3);
                }
                else {
                    data = new (POTHigh * POTWide * 3);

                    var pPixelData = tempData;
                    var pTargetData = data;

                    var imageHeight = image.getHeight();
                    for (var y = 0; y < imageHeight; ++y) {
                        cc.memcpy(pTargetData + POTWide * 3 * y, pPixelData + (image.getWidth()) * 3 * y, (image.getWidth()) * 3);
                    }
                }
                break;
            default:
                cc.Assert(0, "Invalid pixel format");
        }

        // Repack the pixel data into the right format

        if (pixelFormat == cc.kCCTexture2DPixelFormat_RGB565) {
            //Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGGBBBBB"
            tempData = new (POTHigh * POTWide * 2);
            inPixel32 = data;
            outPixel16 = tempData;

            var length = POTWide * POTHigh;
            for (var i = 0; i < length; ++i, ++inPixel32) {
                outPixel16++;
                outPixel16 =
                    ((((inPixel32 >> 0) & 0xFF) >> 3) << 11) | // R
                        ((((inPixel32 >> 8) & 0xFF) >> 2) << 5) | // G
                        ((((inPixel32 >> 16) & 0xFF) >> 3) << 0);   // B
            }

            delete data;
            data = tempData;
        }
        else if (pixelFormat == cc.kCCTexture2DPixelFormat_RGBA4444) {
            //Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRGGGGBBBBAAAA"
            tempData = new (POTHigh * POTWide * 2);
            inPixel32 = data;
            outPixel16 = tempData;

            var length = POTWide * POTHigh;
            for (var i = 0; i < length; ++i, ++inPixel32) {
                outPixel16++;
                outPixel16 =
                    ((((inPixel32 >> 0) & 0xFF) >> 4) << 12) | // R
                        ((((inPixel32 >> 8) & 0xFF) >> 4) << 8) | // G
                        ((((inPixel32 >> 16) & 0xFF) >> 4) << 4) | // B
                        ((((inPixel32 >> 24) & 0xFF) >> 4) << 0); // A
            }

            delete data;
            data = tempData;
        }
        else if (pixelFormat == cc.kCCTexture2DPixelFormat_RGB5A1) {
            //Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGBBBBBA"
            tempData = new (POTHigh * POTWide * 2);
            inPixel32 = data;
            outPixel16 = tempData;

            var length = POTWide * POTHigh;
            for (var i = 0; i < length; ++i, ++inPixel32) {
                outPixel16++;
                outPixel16 =
                    ((((inPixel32 >> 0) & 0xFF) >> 3) << 11) | // R
                        ((((inPixel32 >> 8) & 0xFF) >> 3) << 6) | // G
                        ((((inPixel32 >> 16) & 0xFF) >> 3) << 1) | // B
                        ((((inPixel32 >> 24) & 0xFF) >> 7) << 0); // A
            }

            delete data;
            data = tempData;
        }
        else if (pixelFormat == cc.kCCTexture2DPixelFormat_A8) {
            // fix me, how to convert to A8
            pixelFormat = cc.kCCTexture2DPixelFormat_RGBA8888;

            /*
             * The code can not work, how to convert to A8?
             *
             tempData = new unsigned char[POTHigh * POTWide];
             inPixel32 = (unsigned int*)data;
             outPixel8 = tempData;

             unsigned int length = POTWide * POTHigh;
             for(unsigned int i = 0; i < length; ++i, ++inPixel32)
             {
             outPixel8++ = (inPixel32 >> 24) & 0xFF;
             }

             delete []data;
             data = tempData;
             */
        }

        if (data) {
            this.initWithData(data, pixelFormat, POTWide, POTHigh, imageSize);

            // should be after calling super init
            this._m_bHasPremultipliedAlpha = image.isPremultipliedAlpha();

            //CGContextRelease(context);
            delete data;
        }
        return true;
    }
});

/** sets the default pixel format for UIImagescontains alpha channel.
 If the UIImage contains alpha channel, then the options are:
 - generate 32-bit textures: cc.kCCTexture2DPixelFormat_RGBA8888 (default one)
 - generate 24-bit textures: cc.kCCTexture2DPixelFormat_RGB888
 - generate 16-bit textures: cc.kCCTexture2DPixelFormat_RGBA4444
 - generate 16-bit textures: cc.kCCTexture2DPixelFormat_RGB5A1
 - generate 16-bit textures: cc.kCCTexture2DPixelFormat_RGB565
 - generate 8-bit textures: cc.kCCTexture2DPixelFormat_A8 (only use it if you use just 1 color)

 How does it work ?
 - If the image is an RGBA (with Alpha) then the default pixel format will be used (it can be a 8-bit, 16-bit or 32-bit texture)
 - If the image is an RGB (without Alpha) then an RGB565 or RGB888 texture will be used (16-bit texture)

 @since v0.8
 */
cc.Texture2D.setDefaultAlphaPixelFormat = function (format) {
    cc.g_defaultAlphaPixelFormat = format;
};

/** returns the alpha pixel format
 @since v0.8
 */
cc.Texture2D.defaultAlphaPixelFormat = function () {
    return cc.g_defaultAlphaPixelFormat;
};

/** treats (or not) PVR files as if they have alpha premultiplied.
 Since it is impossible to know at runtime if the PVR images have the alpha channel premultiplied, it is
 possible load them as if they have (or not) the alpha channel premultiplied.

 By default it is disabled.

 @since v0.99.5
 */
cc.Texture2D.PVRImagesHavePremultipliedAlpha = function (haveAlphaPremultiplied) {
    cc.PVRHaveAlphaPremultiplied_ = haveAlphaPremultiplied;
};
