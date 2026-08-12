import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail55')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Computer vision sem LLM em PT-BR: OpenCV, CNNs (ResNet/EfficientNet), object detection YOLO, segmentation (U-Net/SAM), OCR, tracking. Pipeline production com ONNX/Triton.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/computer-vision` },
  ...social({ titulo: `Computer Vision Clássico — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/computer-vision' }),
  title: 'Computer Vision Clássico',
  description: DESCRICAO_CARTAO,
  keywords:
    'computer vision classico, opencv, cnn resnet, yolo object detection, sam segment anything, ocr tesseract paddleocr, onnx triton cv',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
