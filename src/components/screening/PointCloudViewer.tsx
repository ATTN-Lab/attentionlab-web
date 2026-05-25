"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface PointCloudMeta {
  n_points: number;
  total_screened: number;
  color_scales: Record<
    string,
    { min: number; max: number } | Record<string, string>
  >;
  provenance_counts: Record<string, number>;
}

type ColorMode =
  | "bbb_score"
  | "cns_mpo"
  | "pka"
  | "mol_weight"
  | "logp"
  | "tpsa"
  | "provenance";

const COLOR_RAMPS: Record<string, [THREE.Color, THREE.Color]> = {
  bbb_score: [new THREE.Color("#1e3a5f"), new THREE.Color("#5ce5e5")],
  cns_mpo: [new THREE.Color("#2d1b4e"), new THREE.Color("#9d5cff")],
  pka: [new THREE.Color("#4a1942"), new THREE.Color("#f472b6")],
  mol_weight: [new THREE.Color("#1a1a2e"), new THREE.Color("#e2e8f0")],
  logp: [new THREE.Color("#064e3b"), new THREE.Color("#6ee7b7")],
  tpsa: [new THREE.Color("#431407"), new THREE.Color("#fdba74")],
};

const PROVENANCE_COLORS: Record<string, THREE.Color> = {
  enamine_real: new THREE.Color("#9d5cff"),
  pubchem: new THREE.Color("#5ce5e5"),
  existing: new THREE.Color("#f472b6"),
  unknown: new THREE.Color("#94a3b8"),
};

const COLOR_MODE_LABELS: Record<ColorMode, string> = {
  bbb_score: "BBB Score",
  cns_mpo: "CNS-MPO",
  pka: "pKa",
  mol_weight: "Mol Weight",
  logp: "LogP",
  tpsa: "TPSA",
  provenance: "Source",
};

interface LoadedData {
  positions: Float32Array;
  colorArrays: Record<string, Float32Array>;
  provenanceIds: Uint8Array | null;
  meta: PointCloudMeta;
}

async function loadBinary(
  basePath: string,
  filename: string,
  type: "float32" | "uint8"
): Promise<Float32Array | Uint8Array> {
  const res = await fetch(`${basePath}/${filename}`);
  const buf = await res.arrayBuffer();
  return type === "float32" ? new Float32Array(buf) : new Uint8Array(buf);
}

function buildColorBuffer(
  data: LoadedData,
  mode: ColorMode
): Float32Array {
  const n = data.meta.n_points;
  const colors = new Float32Array(n * 3);

  if (mode === "provenance" && data.provenanceIds) {
    const provMap = data.meta.color_scales.provenance_map as Record<
      string,
      string
    >;
    const idToColor: THREE.Color[] = [];
    if (provMap) {
      const maxId = Math.max(...Object.keys(provMap).map(Number));
      for (let i = 0; i <= maxId; i++) {
        const name = provMap[String(i)] || "unknown";
        idToColor[i] = PROVENANCE_COLORS[name] || PROVENANCE_COLORS.unknown;
      }
    }
    for (let i = 0; i < n; i++) {
      const c = idToColor[data.provenanceIds[i]] || PROVENANCE_COLORS.unknown;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
  } else {
    const vals = data.colorArrays[mode];
    const ramp = COLOR_RAMPS[mode] || COLOR_RAMPS.bbb_score;
    const tmp = new THREE.Color();
    if (vals) {
      for (let i = 0; i < n; i++) {
        tmp.copy(ramp[0]).lerp(ramp[1], vals[i]);
        colors[i * 3] = tmp.r;
        colors[i * 3 + 1] = tmp.g;
        colors[i * 3 + 2] = tmp.b;
      }
    }
  }

  return colors;
}

export default function PointCloudViewer({
  basePath = "/screening",
}: {
  basePath?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const dataRef = useRef<LoadedData | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);

  const [colorMode, setColorMode] = useState<ColorMode>("bbb_score");
  const [meta, setMeta] = useState<PointCloudMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [is3D, setIs3D] = useState(true);

  const updateColors = useCallback(
    (mode: ColorMode) => {
      if (!dataRef.current || !pointsRef.current) return;
      const buf = buildColorBuffer(dataRef.current, mode);
      const geom = pointsRef.current.geometry;
      geom.setAttribute("color", new THREE.BufferAttribute(buf, 3));
      (geom.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    },
    []
  );

  // Initialize scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0a0f");

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.2;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // Load data
    (async () => {
      try {
        const metaRes = await fetch(`${basePath}/meta.json`);
        const metaData: PointCloudMeta = await metaRes.json();
        setMeta(metaData);

        const positions3d = (await loadBinary(
          basePath,
          "positions_3d.bin",
          "float32"
        )) as Float32Array;

        let positions2d: Float32Array | null = null;
        try {
          positions2d = (await loadBinary(
            basePath,
            "positions_2d.bin",
            "float32"
          )) as Float32Array;
        } catch {
          // 2D not available
        }

        const colorModes: ColorMode[] = [
          "bbb_score",
          "cns_mpo",
          "pka",
          "mol_weight",
          "logp",
          "tpsa",
        ];
        const colorArrays: Record<string, Float32Array> = {};
        for (const mode of colorModes) {
          try {
            colorArrays[mode] = (await loadBinary(
              basePath,
              `color_${mode}.bin`,
              "float32"
            )) as Float32Array;
          } catch {
            // mode not available
          }
        }

        let provenanceIds: Uint8Array | null = null;
        try {
          provenanceIds = (await loadBinary(
            basePath,
            "color_provenance.bin",
            "uint8"
          )) as Uint8Array;
        } catch {
          // provenance not available
        }

        const loadedData: LoadedData = {
          positions: positions3d,
          colorArrays,
          provenanceIds,
          meta: metaData,
        };
        dataRef.current = loadedData;

        // Build geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions3d, 3)
        );

        // Store 2D positions for toggling
        if (positions2d) {
          const pos2d3 = new Float32Array(metaData.n_points * 3);
          for (let i = 0; i < metaData.n_points; i++) {
            pos2d3[i * 3] = positions2d[i * 2];
            pos2d3[i * 3 + 1] = positions2d[i * 2 + 1];
            pos2d3[i * 3 + 2] = 0;
          }
          geometry.userData.positions2d = pos2d3;
          geometry.userData.positions3d = positions3d;
        }

        const initialColors = buildColorBuffer(loadedData, "bbb_score");
        geometry.setAttribute(
          "color",
          new THREE.BufferAttribute(initialColors, 3)
        );

        const material = new THREE.PointsMaterial({
          size: 0.08,
          vertexColors: true,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const points = new THREE.Points(geometry, material);

        // Center the point cloud
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox!.getCenter(center);
        points.position.sub(center);

        const size = new THREE.Vector3();
        geometry.boundingBox!.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 40 / maxDim;
        points.scale.setScalar(scale);

        scene.add(points);
        pointsRef.current = points;
        setLoading(false);
      } catch (err) {
        console.error("Failed to load point cloud data:", err);
        setLoading(false);
      }
    })();

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [basePath]);

  // Update colors when mode changes
  useEffect(() => {
    updateColors(colorMode);
  }, [colorMode, updateColors]);

  // Toggle 2D/3D
  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const target = is3D
      ? geom.userData.positions3d
      : geom.userData.positions2d;
    if (!target) return;

    // Animate transition
    const current = new Float32Array(posAttr.array);
    const start = performance.now();
    const duration = 800;

    const tweenPositions = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      for (let i = 0; i < current.length; i++) {
        (posAttr.array as Float32Array)[i] =
          current[i] + (target[i] - current[i]) * ease;
      }
      posAttr.needsUpdate = true;
      if (t < 1) requestAnimationFrame(tweenPositions);
    };
    tweenPositions();
  }, [is3D]);

  return (
    <div className="relative w-full h-full">
      {/* Canvas container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#5ce5e5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-sm text-gray-400">
              Loading point cloud...
            </div>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {!loading && meta && (
        <>
          {/* Color mode selector */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              Color by
            </div>
            {(Object.keys(COLOR_MODE_LABELS) as ColorMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                className={`block w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                  colorMode === mode
                    ? "bg-white/15 text-white font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {COLOR_MODE_LABELS[mode]}
              </button>
            ))}
          </div>

          {/* 2D/3D toggle */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setIs3D(false)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                !is3D
                  ? "bg-white/15 text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setIs3D(true)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                is3D
                  ? "bg-white/15 text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              3D
            </button>
          </div>

          {/* Legend */}
          {colorMode !== "provenance" && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                {COLOR_MODE_LABELS[colorMode]}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">
                  {(
                    meta.color_scales[colorMode] as {
                      min: number;
                      max: number;
                    }
                  )?.min?.toFixed(2) ?? "0"}
                </span>
                <div
                  className="h-2 w-24 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${
                      COLOR_RAMPS[colorMode]?.[0]
                        ? `#${COLOR_RAMPS[colorMode][0].getHexString()}`
                        : "#1e3a5f"
                    }, ${
                      COLOR_RAMPS[colorMode]?.[1]
                        ? `#${COLOR_RAMPS[colorMode][1].getHexString()}`
                        : "#5ce5e5"
                    })`,
                  }}
                />
                <span className="text-[10px] text-gray-400">
                  {(
                    meta.color_scales[colorMode] as {
                      min: number;
                      max: number;
                    }
                  )?.max?.toFixed(2) ?? "1"}
                </span>
              </div>
            </div>
          )}

          {/* Provenance legend */}
          {colorMode === "provenance" && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                Data Source
              </div>
              <div className="space-y-1">
                {Object.entries(meta.provenance_counts).map(
                  ([name, count]) => (
                    <div key={name} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: `#${(
                            PROVENANCE_COLORS[name] ||
                            PROVENANCE_COLORS.unknown
                          ).getHexString()}`,
                        }}
                      />
                      <span className="text-[10px] text-gray-300">
                        {name.replace("_", " ")} ({count.toLocaleString()})
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Stats badge */}
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 text-right">
            <div className="text-2xl font-bold text-white">
              {meta.n_points.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400">
              representative compounds shown
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              of {meta.total_screened.toLocaleString()} screened
            </div>
          </div>
        </>
      )}
    </div>
  );
}
