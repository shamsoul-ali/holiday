import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  RadialGradient,
  Stop,
  Text as SvgText,
  Rect,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  SABAH_VIEWBOX,
  SABAH_CONTENT_TRANSLATE_Y,
  SABAH_DISTRICTS,
  SABAH_HIGHLIGHTS,
  SABAH_MAINLAND,
  SIPITANG_PATH,
  sabahDistricts,
  districtsById,
  GEO_TO_DISTRICT,
  HIGHLIGHTS_DISTRICT_ID,
  CAPITAL_GEO_ID,
  SKIP_POLYGONS,
  LABEL_OFFSETS,
  SIPITANG_TRANSFORM,
  AIRPORTS,
  AIRPORT_ANCHORED,
  OFFSHORE_ISLANDS,
  getFoodCountsByDistrict,
  getEventCountsByDistrict,
  getAlertCountsByDistrict,
  getIslandCountsByDistrict,
} from '@/data';
import { Colors } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type MapMode = 'occupancy' | 'crowd' | 'food' | 'activity' | 'safety' | 'islands' | 'plain';

export interface MapPin {
  id: string;
  x: number;
  y: number;
  color?: string;
  label?: string;
  icon?: 'restaurant' | 'camera' | 'flag' | 'water' | 'alert' | 'dot';
}

interface Props {
  mode?: MapMode;
  highlightDistrictIds?: string[];
  overlayPins?: MapPin[];
  selectedDistrictId?: string | null;
  onSelectDistrict?: (id: string) => void;
  showAirports?: boolean;
  showIslands?: boolean;
  height?: number;
  label?: string;
  /** Enable pinch-zoom + pan + double-tap-to-reset. Default true. */
  zoomable?: boolean;
}

// ---- Color helpers ---------------------------------------------------------
function hex2rgb(h: string) {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function rgb2hex(r: number, g: number, b: number) {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hex2rgb(a);
  const [r2, g2, b2] = hex2rgb(b);
  return rgb2hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
function occupancyColor(pct: number) {
  const t = pct / 100;
  if (t < 0.5) return mix('#12253F', '#2EAFE8', t * 2);
  if (t < 0.8) return mix('#2EAFE8', '#F7B731', (t - 0.5) / 0.3);
  return mix('#F7B731', '#F5362F', (t - 0.8) / 0.2);
}
function crowdColor(level: string) {
  switch (level) {
    case 'low': return '#1F4466';
    case 'moderate': return '#2EAFE8';
    case 'high': return '#F7B731';
    case 'very-high': return '#F5362F';
    default: return '#12253F';
  }
}
function countColor(count: number, maxCount: number) {
  if (count === 0) return '#12253F';
  const t = Math.min(1, count / Math.max(1, maxCount));
  if (t < 0.5) return mix('#12253F', '#2EAFE8', t * 2);
  if (t < 0.8) return mix('#2EAFE8', '#F7B731', (t - 0.5) / 0.3);
  return mix('#F7B731', '#F5362F', (t - 0.8) / 0.2);
}

// ---- Pulse animation for airports / anchors -------------------------------
function useBounceValue(duration: number = 2200) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.ease) }), -1, false);
  }, [duration, v]);
  return v;
}

const AirportPulse: React.FC<{ cx: number; cy: number; primary?: boolean }> = ({ cx, cy, primary }) => {
  const pulse = useBounceValue(primary ? 1800 : 2400);
  const r1 = useAnimatedProps(() => ({
    r: 5 + pulse.value * (primary ? 12 : 9),
    opacity: (1 - pulse.value) * (primary ? 0.9 : 0.7),
  }));
  return <AnimatedCircle cx={cx} cy={cy} fill="#FDE68A" animatedProps={r1} />;
};

const CapitalStar: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => {
  const pulse = useBounceValue(2000);
  const ring = useAnimatedProps(() => ({
    r: 8 + pulse.value * 14,
    opacity: (1 - pulse.value) * 0.9,
  }));
  return (
    <>
      <AnimatedCircle cx={cx} cy={cy} fill="#F7B731" animatedProps={ring} />
      <Circle cx={cx} cy={cy} r={7} fill="#FDE68A" opacity={0.35} />
      <Circle cx={cx} cy={cy} r={4} fill="#F7B731" />
      <Circle cx={cx} cy={cy} r={1.8} fill="#FFFFFF" />
    </>
  );
};

// ---- Pin renderer ---------------------------------------------------------
const OverlayPin: React.FC<{ pin: MapPin }> = ({ pin }) => {
  return (
    <G>
      <Circle cx={pin.x} cy={pin.y} r={6.5} fill={pin.color || '#F7B731'} opacity={0.32} />
      <Circle cx={pin.x} cy={pin.y} r={3.5} fill={pin.color || '#F7B731'} />
      <Circle cx={pin.x} cy={pin.y} r={1.3} fill="#FFFFFF" />
    </G>
  );
};

// ---- Main component -------------------------------------------------------
export const SabahMap: React.FC<Props> = ({
  mode = 'occupancy',
  highlightDistrictIds,
  overlayPins,
  selectedDistrictId = null,
  onSelectDistrict,
  showAirports = true,
  showIslands = true,
  height = 320,
  label,
  zoomable = true,
}) => {
  const ty = SABAH_CONTENT_TRANSLATE_Y;
  const vb = `${SABAH_VIEWBOX.x} ${SABAH_VIEWBOX.y} ${SABAH_VIEWBOX.width} ${SABAH_VIEWBOX.height}`;

  // Zoom + pan shared values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * e.scale));
      scale.value = next;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= MIN_SCALE + 0.01) {
        // snap back pan to center when fully zoomed out
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTx.value = 0;
        savedTy.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      const maxPan = 180 * scale.value;
      translateX.value = Math.max(-maxPan, Math.min(maxPan, savedTx.value + e.translationX));
      translateY.value = Math.max(-maxPan, Math.min(maxPan, savedTy.value + e.translationY));
    })
    .onEnd(() => {
      savedTx.value = translateX.value;
      savedTy.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > MIN_SCALE + 0.01) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = 1;
        savedTx.value = 0;
        savedTy.value = 0;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan);
  const gesture = Gesture.Exclusive(doubleTap, composed);

  const animatedWrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Runtime-derived counts for count-based modes
  const counts = useMemo(() => {
    switch (mode) {
      case 'food': return getFoodCountsByDistrict();
      case 'activity': return getEventCountsByDistrict();
      case 'safety': return getAlertCountsByDistrict();
      case 'islands': return getIslandCountsByDistrict();
      default: return {};
    }
  }, [mode]);

  const maxCount = useMemo(() => Math.max(1, ...Object.values(counts)), [counts]);

  const highlightSet = useMemo(() => new Set(highlightDistrictIds || []), [highlightDistrictIds]);

  // Resolve fill for a given district id
  const fillForDistrict = (districtId: string | undefined): string => {
    if (!districtId) return '#1F2E4A';
    const d = districtsById[districtId];
    if (!d) return '#1F2E4A';
    switch (mode) {
      case 'occupancy':
        return occupancyColor(d.occupancy);
      case 'crowd':
        return crowdColor(d.crowdLevel);
      case 'food':
      case 'activity':
      case 'safety':
      case 'islands':
        return countColor(counts[districtId] || 0, maxCount);
      case 'plain':
        return highlightSet.has(districtId) ? Colors.primary : '#1F2E4A';
      default:
        return '#1F2E4A';
    }
  };

  const MapInner = (
    <Animated.View style={[{ width: '100%', height }, zoomable && animatedWrapStyle]}>
      <Svg viewBox={vb} preserveAspectRatio="xMidYMid meet" width="100%" height={height}>
        <Defs>
          <RadialGradient id="sabahBgGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#0A1628" stopOpacity="0" />
            <Stop offset="1" stopColor="#0A1628" stopOpacity="0.35" />
          </RadialGradient>
          <RadialGradient id="capGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#F7B731" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#F7B731" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* BG */}
        <Rect x={SABAH_VIEWBOX.x} y={SABAH_VIEWBOX.y} width={SABAH_VIEWBOX.width} height={SABAH_VIEWBOX.height} fill="#06101E" />
        <Rect x={SABAH_VIEWBOX.x} y={SABAH_VIEWBOX.y} width={SABAH_VIEWBOX.width} height={SABAH_VIEWBOX.height} fill="url(#sabahBgGlow)" />

        <G transform={`translate(0, ${ty})`}>
          {/* Mainland silhouette — subtle base */}
          {SABAH_MAINLAND.map((p, i) => (
            <Path key={`ml-${i}`} d={p.d} fill="#132137" opacity={0.55} />
          ))}

          {/* Sipitang special polygon */}
          <G transform={SIPITANG_TRANSFORM}>
            <Path
              d={SIPITANG_PATH}
              fill={fillForDistrict('sipitang')}
              stroke="#0B1A30"
              strokeWidth={1.4}
              opacity={selectedDistrictId === 'sipitang' ? 1 : 0.92}
              onPress={() => onSelectDistrict?.('sipitang')}
            />
          </G>

          {/* District polygons */}
          {SABAH_DISTRICTS.filter((g) => !SKIP_POLYGONS.has(g.id)).map((g) => {
            const districtId = GEO_TO_DISTRICT[g.id];
            if (!districtId) return null;
            const isCapital = g.id === CAPITAL_GEO_ID;
            const isSelected = selectedDistrictId === districtId;
            const fill = isCapital ? '#F7B731' : fillForDistrict(districtId);
            return (
              <Path
                key={g.id}
                d={g.d}
                fill={fill}
                stroke={isSelected ? '#FFFFFF' : '#0B1A30'}
                strokeWidth={isSelected ? 1.6 : 0.6}
                opacity={isSelected ? 1 : 0.95}
                onPress={() => onSelectDistrict?.(districtId)}
              />
            );
          })}

          {/* Kudat highlights */}
          {SABAH_HIGHLIGHTS.filter((g) => !SKIP_POLYGONS.has(g.id)).map((g) => (
            <Path
              key={g.id}
              d={g.d}
              fill={fillForDistrict(HIGHLIGHTS_DISTRICT_ID)}
              stroke="#0B1A30"
              strokeWidth={0.6}
              opacity={selectedDistrictId === HIGHLIGHTS_DISTRICT_ID ? 1 : 0.95}
              onPress={() => onSelectDistrict?.(HIGHLIGHTS_DISTRICT_ID)}
            />
          ))}

          {/* Capital glow + star */}
          {(() => {
            const kk = SABAH_DISTRICTS.find((g) => g.id === CAPITAL_GEO_ID);
            if (!kk) return null;
            const off = LABEL_OFFSETS[CAPITAL_GEO_ID] || { dx: 0, dy: 0 };
            const cx = kk.cx + off.dx;
            const cy = kk.cy + off.dy;
            return (
              <G>
                <Circle cx={cx} cy={cy} r={20} fill="url(#capGlow)" />
                <CapitalStar cx={cx} cy={cy} />
                <SvgText x={cx} y={cy - 22} fill="#F7B731" fontSize={9} fontWeight="700" textAnchor="middle">
                  CAPITAL · KK
                </SvgText>
              </G>
            );
          })()}

          {/* District labels — only large / notable ones, skip airport-anchored */}
          {SABAH_DISTRICTS.filter((g) => !SKIP_POLYGONS.has(g.id)).map((g) => {
            const districtId = GEO_TO_DISTRICT[g.id];
            if (!districtId) return null;
            if (AIRPORT_ANCHORED.has(districtId)) return null;
            if (g.id === CAPITAL_GEO_ID) return null;
            if (g.area < 2500) return null;
            const off = LABEL_OFFSETS[g.id] || { dx: 0, dy: 0 };
            const name = districtsById[districtId]?.name || districtId;
            return (
              <SvgText
                key={`lbl-${g.id}`}
                x={g.cx + off.dx}
                y={g.cy + off.dy}
                fill="#FFFFFF"
                fontSize={8}
                fontWeight="600"
                opacity={0.78}
                textAnchor="middle"
              >
                {name}
              </SvgText>
            );
          })}

          {/* Airports */}
          {showAirports && AIRPORTS.map((a) => (
            <G key={a.code}>
              <AirportPulse cx={a.cx} cy={a.cy} primary={a.primary} />
              <Circle cx={a.cx} cy={a.cy} r={6} fill="#FDE68A" stroke="#002B7F" strokeWidth={1.5} />
              <SvgText x={a.cx} y={a.cy + 2} fill="#002B7F" fontSize={6} fontWeight="700" textAnchor="middle">✈</SvgText>
              <SvgText x={a.cx} y={a.cy - 10} fill="#FDE68A" fontSize={8} fontWeight="700" textAnchor="middle">
                {a.code}
              </SvgText>
            </G>
          ))}

          {/* Islands */}
          {showIslands && OFFSHORE_ISLANDS.map((isl) => (
            <G key={isl.id}>
              <Circle cx={isl.cx} cy={isl.cy} r={9} fill="none" stroke="#2EAFE8" strokeWidth={0.8} strokeDasharray="2 2" opacity={0.6} />
              <Circle cx={isl.cx} cy={isl.cy} r={3} fill="#2EAFE8" />
              <SvgText x={isl.cx} y={isl.cy + 16} fill="#B3E0F7" fontSize={7} fontWeight="600" textAnchor="middle">
                {isl.name}
              </SvgText>
            </G>
          ))}

          {/* Overlay pins (food, events, etc.) */}
          {overlayPins?.map((pin) => <OverlayPin key={pin.id} pin={pin} />)}
        </G>
      </Svg>
    </Animated.View>
  );

  return (
    <View style={[styles.wrap, { height }]}>
      {zoomable ? (
        <GestureDetector gesture={gesture}>{MapInner}</GestureDetector>
      ) : (
        MapInner
      )}
      {zoomable && (
        <View style={styles.zoomHint} pointerEvents="none">
          <View style={styles.zoomHintChip}>
            <Animated.Text style={styles.zoomHintText}>Pinch to zoom · double-tap to reset</Animated.Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: '#06101E',
    borderRadius: 14,
    overflow: 'hidden',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  zoomHintChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(253,230,104,0.35)',
  },
  zoomHintText: {
    color: 'rgba(253,230,104,0.9)',
    fontSize: 9,
    letterSpacing: 0.6,
  },
});
