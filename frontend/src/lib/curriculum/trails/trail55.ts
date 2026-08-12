import type { Trail } from '../types';

/** Computer Vision Clássico */
export const trilha_trail55: Trail = {
    id: 'trail55', name: 'Computer Vision Clássico',
    color: '#10b981', icon: '👁️',
    desc: 'Computer vision sem depender de LLM: OpenCV para image processing, CNNs (ResNet/EfficientNet), object detection (YOLO), segmentation (U-Net/SAM), OCR prático, tracking. Pipeline de inference em produção com ONNX/TensorRT.',
    level: 'advanced', href: '/computer-vision',
    prerequisites: ['capstone-ml-pipeline-completo'],
    modules: [
      { slug: 'cv-basico-opencv', title: 'Computer vision básico com OpenCV', icon: '🖼️', xp: 45, readTime: 11, desc: 'Imagens como arrays numpy. Color spaces (BGR/RGB/HSV). Filters (blur, edge detection Sobel/Canny). Contours. Quando CV clássico ainda ganha.',
        objetivo: 'Você processa uma imagem como array numpy e sabe quando visão computacional clássica ainda ganha do modelo pesado.', keywords: 'opencv basico, computer vision classico, image processing, canny sobel', nextSuggested: ['image-processing-pipelines'], level: 'intermediate' },
      { slug: 'image-processing-pipelines', title: 'Image processing em pipeline', icon: '🔄', xp: 50, readTime: 12, desc: 'Augmentation (albumentations), normalization, preprocessing para inference. Batch processing. GPU acceleration com CuPy. DALI para data loading.', keywords: 'image processing pipeline, albumentations, cupy, nvidia dali', prerequisites: ['cv-basico-opencv'], nextSuggested: ['cnns-resnet-efficientnet'], level: 'advanced' },
      { slug: 'cnns-resnet-efficientnet', title: 'CNNs: ResNet, EfficientNet, ConvNeXt', icon: '🧠', xp: 55, readTime: 13, desc: 'Convolution mental model, pooling, batch norm. ResNet (skip connections), EfficientNet (compound scaling), ConvNeXt (2022+), ViTs como alternativa. Transfer learning.', keywords: 'cnn convolutional neural network, resnet skip connection, efficientnet, convnext, vit', prerequisites: ['image-processing-pipelines'], nextSuggested: ['object-detection-yolo'], level: 'advanced' },
      { slug: 'object-detection-yolo', title: 'Object detection: YOLO, DETR, RT-DETR', icon: '🎯', xp: 55, readTime: 13, desc: 'Two-stage (Faster R-CNN) vs one-stage (YOLO). YOLOv8/v10 arquitetura. DETR/RT-DETR (transformer-based). mAP, NMS, anchors. Ultralytics ecossistema.', keywords: 'object detection, yolo v8 v10, detr rt-detr, map nms, ultralytics', prerequisites: ['cnns-resnet-efficientnet'], nextSuggested: ['segmentation-unet-sam'], level: 'advanced' },
      { slug: 'segmentation-unet-sam', title: 'Segmentation: U-Net, Mask R-CNN, SAM', icon: '✂️', xp: 55, readTime: 13, desc: 'Semantic vs instance vs panoptic. U-Net (biomédica), Mask R-CNN, SAM (Segment Anything Model da Meta 2023). Click-based prompting em 2024-2026.', keywords: 'image segmentation, unet, mask rcnn, sam segment anything meta', prerequisites: ['object-detection-yolo'], nextSuggested: ['ocr-pratico'], level: 'advanced' },
      { slug: 'ocr-pratico', title: 'OCR na prática: Tesseract, PaddleOCR, TrOCR', icon: '🔤', xp: 50, readTime: 12, desc: 'Tesseract legacy, PaddleOCR open-source moderno, TrOCR (HuggingFace), AWS Textract, Azure Document Intelligence. Layout analysis, tables, forms.', keywords: 'ocr, tesseract, paddleocr, trocr, aws textract', prerequisites: ['segmentation-unet-sam'], nextSuggested: ['capstone-cv-production-pipeline'], level: 'advanced' },
      { slug: 'capstone-cv-production-pipeline', title: 'Capstone: pipeline CV em produção', icon: '🏁', xp: 85, readTime: 20, desc: 'Projeto: detector YOLO fine-tuned em dataset próprio, export ONNX, inference em Triton com dynamic batching, API FastAPI, monitoring drift. Entregáveis: repo + docker + benchmark latência.', nextSuggested: ['bedrock-o-que-e-e-por-que'], keywords: 'cv capstone producao, yolo fine tune, onnx triton, cv benchmark latency', prerequisites: ['ocr-pratico'], level: 'advanced' },
    ],
  };
