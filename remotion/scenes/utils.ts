import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";

/** Fade in from 0→1 over `durationFrames` starting at `startFrame`. */
export function useFadeIn(startFrame = 0, durationFrames = 20) {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Fade out from 1→0 over `durationFrames` ending at `endFrame`. */
export function useFadeOut(endFrame: number, durationFrames = 20) {
  const frame = useCurrentFrame();
  return interpolate(frame, [endFrame - durationFrames, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Slide up: element moves from `offsetY` px to 0 starting at `startFrame`. */
export function useSlideUp(startFrame = 0, offsetY = 40, durationFrames = 25) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 80, stiffness: 180, mass: 0.6 },
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(progress, [0, 1], [offsetY, 0]);
  return { opacity, translateY };
}

/** Slow zoom: scale from `from` to `to` over entire composition. */
export function useSlowZoom(from = 1, to = 1.06) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Floating particle animation — oscillates vertically. */
export function useFloat(speed = 1, offset = 0) {
  const frame = useCurrentFrame();
  return Math.sin((frame + offset) * 0.04 * speed) * 8;
}
