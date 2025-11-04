"use client";

import { useEffect, useState } from "react";
import type {
  Stage as StageType,
  Layer as LayerType,
  Image as ImageType,
  Circle as CircleType,
  Transformer as TransformerType,
} from "react-konva";

// Store the react-konva module
let ReactKonva: any = null;

// Dynamically import react-konva module
const loadReactKonva = async () => {
  if (!ReactKonva) {
    ReactKonva = await import("react-konva");
  }
  return ReactKonva;
};

interface KonvaStageProps {
  stageSize: { width: number; height: number };
  image: HTMLImageElement | null;
  zoom: number;
  imageX: number;
  imageY: number;
  circleRadius: number;
  stageRef: React.RefObject<any>;
  imageRef: React.RefObject<any>;
  circleRef: React.RefObject<any>;
  onStageMouseDown: (e: any) => void;
  onStageMouseUp: () => void;
  onStageMouseMove: (e: any) => void;
}

export default function KonvaStage({
  stageSize,
  image,
  zoom,
  imageX,
  imageY,
  circleRadius,
  stageRef,
  imageRef,
  circleRef,
  onStageMouseDown,
  onStageMouseUp,
  onStageMouseMove,
}: KonvaStageProps) {
  const [isReady, setIsReady] = useState(false);
  const [konvaComponents, setKonvaComponents] = useState<any>(null);

  useEffect(() => {
    // Load react-konva module and ensure React is fully initialized
    if (typeof window !== "undefined") {
      loadReactKonva().then((mod) => {
        // Use requestAnimationFrame to ensure React internals are ready
        requestAnimationFrame(() => {
          // Small delay to ensure React's reconciliation is complete
          setTimeout(() => {
            setKonvaComponents(mod);
            setIsReady(true);
          }, 50);
        });
      });
    }
  }, []);

  if (!isReady || !image || !konvaComponents) {
    return null;
  }

  const { Stage, Layer, Image, Circle, Rect, Shape } = konvaComponents;

  // Circle is always centered on the stage
  const circleCenterX = stageSize.width / 2;
  const circleCenterY = stageSize.height / 2;

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      style={{ cursor: "grab" }}
      onMouseDown={onStageMouseDown}
      onMouseUp={onStageMouseUp}
      onMouseMove={onStageMouseMove}
    >
      <Layer>
        <Image
          alt="Original Image"
          ref={imageRef}
          image={image}
          x={imageX}
          y={imageY}
          width={image.width}
          height={image.height}
          scaleX={zoom}
          scaleY={zoom}
          draggable={false}
        />
        {/* Gray overlay with circular hole cut out */}
        <Shape
          sceneFunc={(context: any, shape: any) => {
            context.beginPath();
            // Draw the outer rectangle (entire stage)
            context.rect(0, 0, stageSize.width, stageSize.height);
            // Draw the inner circle (this creates a hole)
            context.arc(
              circleCenterX,
              circleCenterY,
              circleRadius,
              0,
              Math.PI * 2,
              true // counterclockwise to create a hole
            );
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill="rgba(128, 128, 128, 0.7)"
          listening={false}
        />
        {/* Fixed circle overlay - always centered */}
        <Circle
          ref={circleRef}
          x={circleCenterX}
          y={circleCenterY}
          radius={circleRadius}
          stroke="#ffffff"
          strokeWidth={3}
          dash={[10, 5]}
          listening={false}
        />
        {/* Outer circle border for better visibility */}
        <Circle
          x={circleCenterX}
          y={circleCenterY}
          radius={circleRadius + 2}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={1}
          listening={false}
        />
      </Layer>
    </Stage>
  );
}
