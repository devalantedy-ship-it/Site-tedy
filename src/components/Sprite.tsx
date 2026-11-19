// Ícones em pixel art desenhados aqui mesmo (originais). Cada letra = uma cor da paleta, "." = vazio.
import type { CategoryId } from "@/lib/data";

type Art = { rows: string[]; pal: Record<string, string> };

const ink = "#1a1030";

export const sprites: Record<CategoryId, Art> = {
  // criaturinha com orelhas
  pokemon: {
    rows: [
      ".k........k.",
      "kok......kok",
      "kook....kook",
      "koookkkkoook",
      "kooooooooook",
      "koKKooooKKok",
      "koKwooooKwok",
      "kpooommooopk",
      ".kooooooook.",
      ".kloooooolk.",
      "..kllkkllk..",
      "...kk..kk...",
    ],
    pal: { k: ink, o: "#ffb03b", l: "#e07a1f", K: ink, w: "#ffffff", p: "#ff7aa8", m: "#b3412e" },
  },
  item: {
    rows: [
      "............",
      "...kkkkkk...",
      "..kwccbbbk..",
      ".kwcccbbbbk.",
      "kkkkkkkkkkkk",
      "kwccccbbbbdk",
      ".kwcccbbbdk.",
      "..kwccbbdk..",
      "...kwcbdk...",
      "....kwdk....",
      ".....kk.....",
      "............",
    ],
    pal: { k: ink, w: "#e6fbff", c: "#7ce8ff", b: "#3fa8ff", d: "#2563c9" },
  },
  char: {
    rows: [
      "...kkkkkk...",
      "..krrrrrrk..",
      ".krrrwrrrrk.",
      "kkkkkkkkkkkk",
      "..kssssssk..",
      "..ksKssKsk..",
      "..kssssssk..",
      "...kssssk...",
      "..kbbbbbbk..",
      ".kbbbybbbbk.",
      ".kbbbbbbbbk.",
      "..kk....kk..",
    ],
    pal: { k: ink, r: "#ff4f5e", w: "#ffffff", s: "#ffd2a6", K: ink, b: "#3d7bff", y: "#ffd23f" },
  },
  kk: {
    rows: [
      "............",
      "....kkkk....",
      "..kkyyyykk..",
      ".kywyyyyyok.",
      ".kyyykkyyok.",
      ".kkyyyyyokk.",
      ".kykkkkkkok.",
      ".kywyyyyyok.",
      ".kkyyyyyokk.",
      ".kykkkkkkok.",
      "..kkoooookk.",
      "....kkkk....",
    ],
    pal: { k: ink, y: "#ffd23f", w: "#fff6c9", o: "#d99a14" },
  },
  servico: {
    rows: [
      "..........kk",
      ".........kwk",
      "........kwsk",
      ".......kwsk.",
      "......kwsk..",
      "..k..kwsk...",
      "..kkkwsk....",
      "...kgsk.....",
      "..kgkkk.....",
      ".kgk..k.....",
      "kbk.........",
      "kk..........",
    ],
    pal: { k: ink, w: "#ffffff", s: "#b8c4e6", g: "#ffd23f", b: "#a35b2a" },
  },
};

export function Sprite({ id, size = 48, className = "" }: { id: CategoryId; size?: number; className?: string }) {
  const art = sprites[id];
  const n = 12;
  const rects: React.ReactNode[] = [];
  art.rows.forEach((row, y) =>
    [...row.slice(0, n)].forEach((ch, x) => {
      const fill = art.pal[ch];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.04} height={1.04} fill={fill} />);
    }),
  );
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} shapeRendering="crispEdges" className={className} aria-hidden>
      {rects}
    </svg>
  );
}
