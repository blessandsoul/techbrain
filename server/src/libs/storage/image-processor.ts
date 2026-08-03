import { spawn } from 'node:child_process';

type ImageMetadata = {
  format?: string;
  width?: number;
  height?: number;
};

type ResizeOptions = {
  fit?: 'inside';
  withoutEnlargement?: boolean;
};

type WebpOptions = {
  quality?: number;
  effort?: number;
};

type MetadataOptions = {
  exif?: Record<string, never>;
  icc?: undefined;
};

type ResizeConfig = {
  width?: number;
  height?: number;
  options?: ResizeOptions;
};

type SharpFactory = typeof import('sharp').default;

const IMAGE_PROCESSOR_TIMEOUT_MS = 30_000;
const IMAGE_PROCESSOR_MAX_OUTPUT_BYTES = 30 * 1024 * 1024;

let sharpFactoryPromise: Promise<SharpFactory> | undefined;

function getSharpFactory(): Promise<SharpFactory> {
  sharpFactoryPromise ??= import('sharp').then(({ default: sharp }) => sharp);
  return sharpFactoryPromise;
}

function shouldUseImageMagick(): boolean {
  return process.env.IMAGE_PROCESSOR === 'imagemagick';
}

function runImageMagick(args: string[], input: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn('magick', args, {
      shell: false,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let settled = false;

    const finish = (error?: Error, output?: Buffer): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (error) {
        reject(error);
      } else {
        resolve(output ?? Buffer.alloc(0));
      }
    };

    const timeout = setTimeout(() => {
      child.kill();
      finish(new Error('ImageMagick processing timed out'));
    }, IMAGE_PROCESSOR_TIMEOUT_MS);

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > IMAGE_PROCESSOR_MAX_OUTPUT_BYTES) {
        child.kill();
        finish(new Error('ImageMagick output exceeded the safety limit'));
        return;
      }
      stdout.push(chunk);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const remainingBytes = 16_384 - stderrBytes;
      if (remainingBytes <= 0) return;

      const captured = chunk.subarray(0, remainingBytes);
      stderr.push(captured);
      stderrBytes += captured.length;
    });

    child.on('error', (error) => {
      finish(new Error(`Unable to start ImageMagick: ${error.message}`));
    });

    child.on('close', (code) => {
      if (settled) return;
      if (code !== 0) {
        const message = Buffer.concat(stderr).toString('utf8').trim();
        finish(new Error(`ImageMagick failed${message ? `: ${message}` : ''}`));
        return;
      }
      finish(undefined, Buffer.concat(stdout));
    });

    child.stdin.on('error', (error) => {
      finish(new Error(`Unable to send image to ImageMagick: ${error.message}`));
    });
    child.stdin.end(input);
  });
}

class ImageProcessorPipeline {
  private resizeConfig?: ResizeConfig;
  private webpConfig?: WebpOptions;
  private metadataConfig?: MetadataOptions;

  constructor(private readonly input: Buffer) {}

  async metadata(): Promise<ImageMetadata> {
    if (!shouldUseImageMagick()) {
      const sharp = await getSharpFactory();
      return sharp(this.input).metadata();
    }

    const output = await runImageMagick(
      ['identify', '-ping', '-format', '%m|%w|%h\n', '-'],
      this.input
    );
    const [firstFrame = ''] = output.toString('utf8').trim().split(/\r?\n/);
    const [format, width, height] = firstFrame.split('|');

    return {
      format: format?.toLowerCase(),
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
    };
  }

  resize(width?: number, height?: number, options?: ResizeOptions): this {
    this.resizeConfig = { width, height, options };
    return this;
  }

  webp(options?: WebpOptions): this {
    this.webpConfig = options;
    return this;
  }

  withMetadata(options?: MetadataOptions): this {
    this.metadataConfig = options;
    return this;
  }

  async toBuffer(): Promise<Buffer> {
    if (!shouldUseImageMagick()) {
      const sharp = await getSharpFactory();
      let pipeline = sharp(this.input);

      if (this.resizeConfig) {
        pipeline = pipeline.resize(
          this.resizeConfig.width,
          this.resizeConfig.height,
          this.resizeConfig.options
        );
      }
      if (this.webpConfig) {
        pipeline = pipeline.webp(this.webpConfig);
      }
      if (this.metadataConfig) {
        pipeline = pipeline.withMetadata(this.metadataConfig);
      }

      return pipeline.toBuffer();
    }

    const args = ['-'];
    if (this.resizeConfig) {
      const width = this.resizeConfig.width ?? '';
      const height = this.resizeConfig.height ?? '';
      const withoutEnlargement = this.resizeConfig.options?.withoutEnlargement ? '>' : '';
      args.push('-resize', `${width}x${height}${withoutEnlargement}`);
    }
    if (this.metadataConfig) {
      args.push('-strip');
    }
    if (this.webpConfig?.effort !== undefined) {
      args.push('-define', `webp:method=${this.webpConfig.effort}`);
    }
    if (this.webpConfig?.quality !== undefined) {
      args.push('-quality', String(this.webpConfig.quality));
    }
    args.push('webp:-');

    return runImageMagick(args, this.input);
  }
}

export function imageProcessor(input: Buffer): ImageProcessorPipeline {
  return new ImageProcessorPipeline(input);
}
