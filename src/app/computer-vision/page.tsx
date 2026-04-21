import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail55')!;

export const metadata: Metadata = {
  title: 'Computer Vision Clássico — FFV Academy',
  description:
    'Computer vision sem LLM em PT-BR: OpenCV, CNNs (ResNet/EfficientNet), object detection YOLO, segmentation (U-Net/SAM), OCR, tracking. Pipeline production com ONNX/Triton.',
  keywords:
    'computer vision classico, opencv, cnn resnet, yolo object detection, sam segment anything, ocr tesseract paddleocr, onnx triton cv',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
