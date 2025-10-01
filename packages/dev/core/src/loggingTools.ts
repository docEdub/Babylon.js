/* eslint-disable no-console */

let LoggingEnabled = false;

export function SetLoggingEnabled(enabled: boolean): void {
    LoggingEnabled = enabled;
}

export function EnableLogging(): void {
    SetLoggingEnabled(true);
}

export function DisableLogging(): void {
    SetLoggingEnabled(false);
}

export function LogString(msg: string): void {
    if (!LoggingEnabled) {
        return;
    }

    console.log(msg);
}

export function LogRenderStart(): void {
    LogString(`
------------------------------------------------------------------------------------------------------------------------
Render ...
------------------------------------------------------------------------------------------------------------------------
`);
}

export function LogRenderDone(): void {
    LogString(`
------------------------------------------------------------------------------------------------------------------------
Render - done
------------------------------------------------------------------------------------------------------------------------
`);
}

export function LogWebGLBindFramebuffer(gl: WebGL2RenderingContext, target: number, framebuffer: WebGLFramebuffer | null): void {
    if (!LoggingEnabled) {
        return;
    }

    const targetString = target === 0x8ca8 ? "GL_READ_FRAMEBUFFER" : target === 0x8ca9 ? "GL_DRAW_FRAMEBUFFER" : target === 0x8d40 ? "GL_FRAMEBUFFER" : `Unknown(${target})`;
    const framebufferString = GetWebGLFramebufferString(gl, framebuffer);
    console.trace(`\n\nWebGL.bindFramebuffer(${targetString}, ${framebufferString})`);
}

function GetWebGLFramebufferString(gl: WebGL2RenderingContext, framebuffer: WebGLFramebuffer | null): string {
    if (!framebuffer) {
        return "null";
    }

    // Save the current framebuffer binding
    const currentFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    // Bind the framebuffer we want to query
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Get viewport dimensions to determine framebuffer size
    const viewport = gl.getParameter(gl.VIEWPORT);
    const framebufferWidth = viewport[2];
    const framebufferHeight = viewport[3];

    const attachmentPoints = [
        { name: "COLOR_ATTACHMENT0", value: gl.COLOR_ATTACHMENT0 },
        { name: "DEPTH_ATTACHMENT", value: gl.DEPTH_ATTACHMENT },
        { name: "STENCIL_ATTACHMENT", value: gl.STENCIL_ATTACHMENT },
        { name: "DEPTH_STENCIL_ATTACHMENT", value: gl.DEPTH_STENCIL_ATTACHMENT },
    ];

    const attachmentInfo: string[] = [];

    for (const attachment of attachmentPoints) {
        const objectType = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment.value, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);

        if (objectType === gl.RENDERBUFFER) {
            const renderbuffer = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment.value, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
            attachmentInfo.push(`${attachment.name}: RENDERBUFFER(${renderbuffer})`);
        } else if (objectType === gl.TEXTURE) {
            const texture = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment.value, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
            const level = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment.value, gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL);
            const cubeMapFace = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment.value, gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE);

            let width = 0;
            let height = 0;

            // Check if this is a multiview/2D array texture by querying the attachment
            let isMultiview = false;
            try {
                const textureLayered = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, attachment.value, (gl as any).FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER);
                isMultiview = textureLayered !== undefined && textureLayered >= 0;
            } catch (e) {
                // Not a layered texture
            }

            // Try to determine texture target and get dimensions
            const textureWidth = 0x1000; // TEXTURE_WIDTH
            const textureHeight = 0x1001; // TEXTURE_HEIGHT

            // Save current texture bindings
            const currentTexture2D = gl.getParameter(gl.TEXTURE_BINDING_2D);
            const currentTextureCube = gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP);
            const currentTexture2DArray = gl.getParameter((gl as any).TEXTURE_BINDING_2D_ARRAY);

            // Clear any existing errors first
            while (gl.getError() !== gl.NO_ERROR) {
                /* clear error queue */
            }

            // Try TEXTURE_2D_ARRAY first if it's a multiview texture
            if (isMultiview) {
                // Note: Multiview textures created with framebufferTextureMultiviewOVR don't have
                // queryable dimensions via getTexParameter. The dimensions are tracked by the
                // RenderTargetWrapper, not the WebGLTexture itself.
                // We could bind and try, but it will return null.
            } else if (cubeMapFace !== 0) {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                const error = gl.getError();
                if (error === gl.NO_ERROR) {
                    width = gl.getTexParameter(gl.TEXTURE_CUBE_MAP, textureWidth);
                    height = gl.getTexParameter(gl.TEXTURE_CUBE_MAP, textureHeight);
                } else {
                    // Clear the error and try as 2D texture
                    while (gl.getError() !== gl.NO_ERROR) {
                        /* clear error queue */
                    }
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    const error2 = gl.getError();
                    if (error2 === gl.NO_ERROR) {
                        width = gl.getTexParameter(gl.TEXTURE_2D, textureWidth);
                        height = gl.getTexParameter(gl.TEXTURE_2D, textureHeight);
                    }
                }
            } else {
                // Try TEXTURE_2D
                gl.bindTexture(gl.TEXTURE_2D, texture);
                const error = gl.getError();
                if (error === gl.NO_ERROR) {
                    width = gl.getTexParameter(gl.TEXTURE_2D, textureWidth);
                    height = gl.getTexParameter(gl.TEXTURE_2D, textureHeight);
                }
            }

            // Restore texture bindings
            gl.bindTexture(gl.TEXTURE_2D, currentTexture2D);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, currentTextureCube);
            const texture2dArray = 0x8c1a;
            gl.bindTexture(texture2dArray, currentTexture2DArray);

            let textureInfo = `TEXTURE(${texture}`;
            if (isMultiview) {
                textureInfo += `, multiview, level=${level}`;
            } else {
                textureInfo += `, ${width}x${height}, level=${level}`;
            }
            if (cubeMapFace !== 0) {
                const faceNames = ["POSITIVE_X", "NEGATIVE_X", "POSITIVE_Y", "NEGATIVE_Y", "POSITIVE_Z", "NEGATIVE_Z"];
                const faceIndex = cubeMapFace - gl.TEXTURE_CUBE_MAP_POSITIVE_X;
                textureInfo += `, face=${faceNames[faceIndex] || cubeMapFace}`;
            }
            textureInfo += ")";
            attachmentInfo.push(`${attachment.name}: ${textureInfo}`);
        } else if (objectType !== gl.NONE) {
            attachmentInfo.push(`${attachment.name}: UNKNOWN_TYPE(${objectType})`);
        }
    }

    // Restore the original framebuffer binding
    gl.bindFramebuffer(gl.FRAMEBUFFER, currentFramebuffer);

    if (attachmentInfo.length === 0) {
        return `${framebuffer} [no attachments]`;
    }

    let result = `${framebuffer}`;
    if (framebufferWidth > 0 && framebufferHeight > 0) {
        result += ` ${framebufferWidth}x${framebufferHeight}`;
    }
    result += ` [${attachmentInfo.join(", ")}]`;
    return result;
}
