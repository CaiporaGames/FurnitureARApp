import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  ViroARScene,
  ViroARSceneNavigator,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroARPlane,
  ViroQuad,
  ViroSphere,
  ViroMaterials,
  ViroTrackingStateConstants,
  ViroNode,
} from '@reactvision/react-viro';

import { RootStackParamList } from '../navigation/AppNavigator';
import { productController } from '../features/products/product.controller';

ViroMaterials.createMaterials({
  detectedPlane: {
    diffuseColor: 'rgba(0, 150, 255, 0.35)',
  },
  manualPoint: {
    diffuseColor: 'rgba(255, 200, 0, 1)',
  },
  manualPlane: {
    diffuseColor: 'rgba(255, 200, 0, 0.25)',
  },
});

type Props = NativeStackScreenProps<RootStackParamList, 'ARViewer'>;
type Vector3 = [number, number, number];

type ARSceneProps = {
  onStatusChange: (message: string) => void;
  onObjectPlaced: () => void;
  scaleValue: number;
  rotationY: number;
  nudge: { dx: number; dz: number; id: number } | null;
  resetSignal: number;
  manualMode: boolean;
};

const SOFA_MODEL_SOURCE = {
  uri: 'file:///android_asset/models/sofa.glb',
};

const NUDGE_STEP = 0.05;

function isVector3(value: unknown): value is Vector3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(item => typeof item === 'number')
  );
}

function centroid(points: Vector3[]): Vector3 {
  const n = points.length;
  return [
    points.reduce((s, p) => s + p[0], 0) / n,
    points.reduce((s, p) => s + p[1], 0) / n,
    points.reduce((s, p) => s + p[2], 0) / n,
  ];
}

function planeRotationY(p0: Vector3, p1: Vector3): number {
  const ax = p1[0] - p0[0];
  const az = p1[2] - p0[2];
  return (Math.atan2(ax, az) * 180) / Math.PI;
}

// ─── AR Scene ────────────────────────────────────────────────────────────────

function FurnitureARScene({ sceneNavigator }: any) {
  const {
    onStatusChange,
    onObjectPlaced,
    scaleValue,
    rotationY,
    nudge,
    resetSignal,
    manualMode,
  } = sceneNavigator.viroAppProps as ARSceneProps;

  const [isTracking, setIsTracking] = useState(false);
  const [hasPlacedObject, setHasPlacedObject] = useState(false);
  const [position, setPosition] = useState<Vector3>([0, 0, -1]);
  const [manualPoints, setManualPoints] = useState<Vector3[]>([]);

  const lastNudgeId = useRef<number | null>(null);
  const manualModeRef = useRef(manualMode);

  useEffect(() => {
    manualModeRef.current = manualMode;
  }, [manualMode]);

  useEffect(() => {
    if (resetSignal > 0) {
      setHasPlacedObject(false);
      setPosition([0, 0, -1]);
      setManualPoints([]);
    }
  }, [resetSignal]);

  useEffect(() => {
    if (!nudge || nudge.id === lastNudgeId.current) return;
    lastNudgeId.current = nudge.id;
    setPosition(prev => [prev[0] + nudge.dx, prev[1], prev[2] + nudge.dz]);
  }, [nudge]);

  useEffect(() => {
    setManualPoints([]);
    if (!hasPlacedObject) {
      onStatusChange(
        manualMode
          ? 'Toca em 3 pontos no chão para definir o plano.'
          : 'Procura uma zona azul no chão e toca nela.',
      );
    }
  }, [manualMode]);

  const onTrackingUpdated: React.ComponentProps<
    typeof ViroARScene
  >['onTrackingUpdated'] = state => {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setIsTracking(true);
      if (!hasPlacedObject) {
        onStatusChange(
          manualModeRef.current
            ? 'Toca em 3 pontos no chão para definir o plano.'
            : 'Procura uma zona azul no chão e toca nela.',
        );
      }
    }
    if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      setIsTracking(false);
      onStatusChange('Move o telemóvel devagar para reconhecer o espaço.');
    }
  };

  const placeObjectAt = (pos: Vector3) => {
    setPosition(pos);
    setHasPlacedObject(true);
    onObjectPlaced();
    onStatusChange('Sofá colocado. Usa os botões para ajustar.');
  };

  const handleManualTap = (tapPosition: unknown) => {
    if (!isVector3(tapPosition)) return;

    setManualPoints(prev => {
      const next = [...prev, tapPosition as Vector3];

      if (next.length === 1) {
        onStatusChange('Ponto 1/3 marcado. Toca no 2º ponto.');
      } else if (next.length === 2) {
        onStatusChange('Ponto 2/3 marcado. Toca no 3º ponto.');
      } else if (next.length >= 3) {
        const pts = next.slice(0, 3) as [Vector3, Vector3, Vector3];
        placeObjectAt(centroid(pts));
        return pts;
      }

      return next;
    });
  };

  return (
    <ViroARScene onTrackingUpdated={onTrackingUpdated}>
      <ViroAmbientLight color="#ffffff" intensity={250} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.5]}
        intensity={900}
      />

      {/* Auto-detect mode */}
      {isTracking && !hasPlacedObject && !manualMode && (
        <ViroARPlane
          minHeight={0.3}
          minWidth={0.3}
          alignment="Horizontal"
          onAnchorFound={() =>
            onStatusChange('Superfície encontrada. Toca na zona azul.')
          }
        >
          <ViroQuad
            position={[0, 0, 0]}
            rotation={[-90, 0, 0]}
            width={1}
            height={1}
            materials={['detectedPlane']}
            onClick={(clickPosition: unknown) => {
              if (isVector3(clickPosition)) placeObjectAt(clickPosition);
            }}
          />
        </ViroARPlane>
      )}

      {/* Manual mode: large semi-transparent quad to capture taps */}
      {isTracking && !hasPlacedObject && manualMode && (
        <ViroNode position={[0, -0.01, 0]}>
          <ViroQuad
            position={[0, 0, -1.5]}
            rotation={[-90, 0, 0]}
            width={10}
            height={10}
            materials={['manualPlane']}
            onClick={handleManualTap}
          />
        </ViroNode>
      )}

      {/* Manual point markers */}
      {manualMode &&
        manualPoints.map((pt, i) => (
          <ViroSphere
            key={i}
            position={pt}
            radius={0.03}
            materials={['manualPoint']}
          />
        ))}

      {/* Sofa */}
      {hasPlacedObject && (
        <Viro3DObject
          source={SOFA_MODEL_SOURCE}
          type="GLB"
          position={position}
          rotation={[0, rotationY, 0]}
          scale={[scaleValue, scaleValue, scaleValue]}
          dragType="FixedToWorld"
          onDrag={(draggedPosition: unknown) => {
            if (isVector3(draggedPosition)) setPosition(draggedPosition);
          }}
        />
      )}
    </ViroARScene>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ARViewerScreen({ route, navigation }: Props) {
  const { productId } = route.params;

  const [statusMessage, setStatusMessage] = useState(
    'Move o telemóvel devagar para escanear o espaço.',
  );
  const [hasPlacedObject, setHasPlacedObject] = useState(false);
  const [scaleValue, setScaleValue] = useState(0.35);
  const [rotationY, setRotationY] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [nudge, setNudge] = useState<{ dx: number; dz: number; id: number } | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const nudgeIdRef = useRef(0);

  useEffect(() => {
    productController.selectProduct(productId);
  }, [productId]);

  const resetPlacement = () => {
    setStatusMessage('Move o telemóvel devagar para escanear o espaço.');
    setHasPlacedObject(false);
    setScaleValue(0.35);
    setRotationY(0);
    setNudge(null);
    setResetSignal(prev => prev + 1);
  };

  const toggleMode = () => setManualMode(prev => !prev);

  const increaseScale = () => setScaleValue(prev => Math.min(prev + 0.05, 1.5));
  const decreaseScale = () => setScaleValue(prev => Math.max(prev - 0.05, 0.1));
  const rotateLeft = () => setRotationY(prev => prev - 10);
  const rotateRight = () => setRotationY(prev => prev + 10);

  const sendNudge = (dx: number, dz: number) => {
    nudgeIdRef.current += 1;
    setNudge({ dx, dz, id: nudgeIdRef.current });
  };

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{
          scene: FurnitureARScene as unknown as () => React.JSX.Element,
        }}
        viroAppProps={{
          onStatusChange: setStatusMessage,
          onObjectPlaced: () => setHasPlacedObject(true),
          scaleValue,
          rotationY,
          nudge,
          resetSignal,
          manualMode,
        }}
        style={styles.ar}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Ver na Minha Sala</Text>

        {/* Mode toggle */}
        <Pressable style={styles.modeToggle} onPress={toggleMode}>
          <Text style={styles.modeToggleLabel}>
            {manualMode ? '3 pts' : 'Auto'}
          </Text>
          <View style={[styles.modeToggleTrack, manualMode && styles.modeToggleTrackActive]}>
            <View style={[styles.modeToggleThumb, manualMode && styles.modeToggleThumbActive]} />
          </View>
        </Pressable>
      </View>

      {/* Status */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>AR Preview</Text>
        <Text style={styles.instructionText}>{statusMessage}</Text>
      </View>

      {/* Controls */}
      {hasPlacedObject && (
        <View style={styles.controlsPanel}>

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Tamanho</Text>
            <View style={styles.controlButtons}>
              <Pressable style={styles.roundButton} onPress={decreaseScale}>
                <Text style={styles.roundButtonText}>−</Text>
              </Pressable>
              <Text style={styles.controlValue}>{Math.round(scaleValue * 100)}%</Text>
              <Pressable style={styles.roundButton} onPress={increaseScale}>
                <Text style={styles.roundButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Rodar</Text>
            <View style={styles.controlButtons}>
              <Pressable style={styles.roundButton} onPress={rotateLeft}>
                <Text style={styles.roundButtonText}>↺</Text>
              </Pressable>
              <Text style={styles.controlValue}>{rotationY}°</Text>
              <Pressable style={styles.roundButton} onPress={rotateRight}>
                <Text style={styles.roundButtonText}>↻</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Mover</Text>
            <View style={styles.dpadContainer}>
              <Pressable style={styles.dpadButton} onPress={() => sendNudge(0, -NUDGE_STEP)}>
                <Text style={styles.dpadText}>↑</Text>
              </Pressable>
              <View style={styles.dpadRow}>
                <Pressable style={styles.dpadButton} onPress={() => sendNudge(-NUDGE_STEP, 0)}>
                  <Text style={styles.dpadText}>←</Text>
                </Pressable>
                <View style={styles.dpadCenter} />
                <Pressable style={styles.dpadButton} onPress={() => sendNudge(NUDGE_STEP, 0)}>
                  <Text style={styles.dpadText}>→</Text>
                </Pressable>
              </View>
              <Pressable style={styles.dpadButton} onPress={() => sendNudge(0, NUDGE_STEP)}>
                <Text style={styles.dpadText}>↓</Text>
              </Pressable>
            </View>
          </View>

        </View>
      )}

      {/* Bottom */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.actionButton} onPress={resetPlacement}>
          <Text style={styles.actionButtonText}>Recolocar</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  ar: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 36,
    left: 16,
    right: 16,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    marginLeft: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeToggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
    minWidth: 28,
    textAlign: 'right',
  },
  modeToggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#cccccc',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  modeToggleTrackActive: {
    backgroundColor: '#f5a623',
  },
  modeToggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  modeToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  instructions: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 220,
    backgroundColor: 'rgba(0,0,0,0.78)',
    padding: 14,
    borderRadius: 16,
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  controlsPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 88,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  controlGroup: {
    flex: 1,
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  controlValue: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
  dpadContainer: {
    alignItems: 'center',
    gap: 2,
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dpadButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  dpadCenter: {
    width: 30,
    height: 30,
  },
  bottomActions: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  actionButtonText: {
    color: '#111111',
    fontWeight: '800',
  },
});