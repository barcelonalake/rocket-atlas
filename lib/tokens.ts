// Telemetry Paper — design tokens shared between the 3D scene and the CSS.
export const TK = {
  paper: 0xf6f5f0,
  ink: 0x17191c,
  ink2: 0x5a5f66,
  line: 0xe2e0d8,
  line2: 0xcfccc2,
  acc: 0xe8501c,
  lox: 0x1596b4,
  fuel: 0xe59a2f,
  hot: 0xd8483a,
  hotF: 0xb03a5e,
  teb: 0x2fbf71,
} as const;

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');
