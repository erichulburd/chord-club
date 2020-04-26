import ImagePicker, { Options } from 'react-native-image-crop-picker';
import { Image, Dimensions, ScaledSize } from 'react-native';

interface Size {
  height: number;
  width: number;
}

export const pickSingleImage = async (opts: Partial<Options> = {}) => {
  const res = await ImagePicker.openPicker({
    cropping: true,
    multiple: false,
    mediaType: 'photo',
    writeTempFile: true,
    enableRotationGesture: true,
    freeStyleCropEnabled: true,
    ...opts,
  });
  if (res instanceof Array) {
    if (res.length >= 1) {
      return ResizableImage.new(res[0].path);
    }
  } else {
    return ResizableImage.new(res.path);
  }
  return null;
}

export class ResizableImage {
  public uri: string;
  public height: number;
  public width: number;
  public aspectRatio: number;

  constructor(uri: string, width: number, height: number) {
    this.uri = uri;
    this.width = width;
    this.height = height;
    this.aspectRatio = width / height;
  }

  public coverDimensions(size: Partial<Size> = {}): Size {
    const { height, width } = {
      ...Dimensions.get('window'),
      ...size,
    };
    const resizeRatio = Math.min(width / this.width, height / this.height);
    return {
      width: this.width * resizeRatio,
      height: this.height * resizeRatio,
    }
  }

  static async new(filePath: string): Promise<ResizableImage> {
    return new Promise((resolve, reject) => {
      Image.getSize(filePath, (width, height) => {
        resolve(new ResizableImage(`file://${filePath}`, width, height));
      }, reject);
    });
  }

  static async newFromURL(url: string): Promise<ResizableImage> {
    return new Promise((resolve, reject) => {
      Image.getSize(url, (width, height) => {
        resolve(new ResizableImage(url, width, height));
      }, reject);
    });
  }
}


