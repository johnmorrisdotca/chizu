export const RAD = Math.PI / 180;

/** The oracle: the length of the geodesic between two points on the WGS 84 ellipsoid, by Vincenty's inverse formula. */
export function vincenty(a: readonly [number, number], b: readonly [number, number]): number {
  const A = 6378137;
  const F = 1 / 298.257223563;
  const B = A * (1 - F);
  const L = (b[0] - a[0]) * RAD;
  const U1 = Math.atan((1 - F) * Math.tan(a[1] * RAD));
  const U2 = Math.atan((1 - F) * Math.tan(b[1] * RAD));
  let lambda = L;
  let sinSigma = 0;
  let cosSigma = 0;
  let sigma = 0;
  let cos2Alpha = 0;
  let cos2SigmaM = 0;
  for (let i = 0; i < 200; i += 1) {
    const sinL = Math.sin(lambda);
    const cosL = Math.cos(lambda);
    sinSigma = Math.hypot(Math.cos(U2) * sinL, Math.cos(U1) * Math.sin(U2) - Math.sin(U1) * Math.cos(U2) * cosL);
    if (sinSigma === 0) return 0;
    cosSigma = Math.sin(U1) * Math.sin(U2) + Math.cos(U1) * Math.cos(U2) * cosL;
    sigma = Math.atan2(sinSigma, cosSigma);
    const sinAlpha = (Math.cos(U1) * Math.cos(U2) * sinL) / sinSigma;
    cos2Alpha = 1 - sinAlpha * sinAlpha;
    cos2SigmaM = cos2Alpha === 0 ? 0 : cosSigma - (2 * Math.sin(U1) * Math.sin(U2)) / cos2Alpha;
    const C = (F / 16) * cos2Alpha * (4 + F * (4 - 3 * cos2Alpha));
    const next =
      L + (1 - C) * F * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM ** 2)));
    if (Math.abs(next - lambda) < 1e-13) {
      lambda = next;
      break;
    }
    lambda = next;
  }
  const u2 = (cos2Alpha * (A * A - B * B)) / (B * B);
  const bigA = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const bigB = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
  const delta =
    bigB *
    sinSigma *
    (cos2SigmaM +
      (bigB / 4) *
        (cosSigma * (-1 + 2 * cos2SigmaM ** 2) -
          (bigB / 6) * cos2SigmaM * (-3 + 4 * sinSigma ** 2) * (-3 + 4 * cos2SigmaM ** 2)));
  return B * bigA * (sigma - delta);
}

/** Places that are really there, with the ground between them as the ellipsoid has it; none is on the map's own centre. */
export const PAIRS: Array<{
  where: string;
  centre: [number, number];
  a: [number, number];
  b: [number, number];
  widthMetres: number;
}> = [
  {
    where: "Wembley Stadium to the Olympic Park, London, 51.6°N",
    centre: [-0.2795, 51.556],
    a: [-0.2795, 51.556],
    b: [-0.0166, 51.5387],
    widthMetres: 40_000,
  },
  {
    where: "Tokyo Dome to Meiji Jingu Stadium, 35.7°N",
    centre: [139.7519, 35.7056],
    a: [139.7519, 35.7056],
    b: [139.7172, 35.6745],
    widthMetres: 20_000,
  },
  {
    where: "Sydney Cricket Ground to Accor Stadium, 33.9°S",
    centre: [151.2247, -33.8914],
    a: [151.2247, -33.8914],
    b: [151.0636, -33.8467],
    widthMetres: 40_000,
  },
  {
    where: "Quito's two ends, on the equator",
    centre: [-78.4678, -0.1807],
    a: [-78.4678, -0.1807],
    b: [-78.4678, -0.0007],
    widthMetres: 30_000,
  },
  {
    where: "Tromsø to Kvaløya, 69.7°N",
    centre: [18.9553, 69.6492],
    a: [18.9553, 69.6492],
    b: [18.7712, 69.7123],
    widthMetres: 30_000,
  },
  {
    where: "Two ends of a pitch, 100 m, at 45°N",
    centre: [-73.5, 45],
    a: [-73.5, 45],
    b: [-73.49, 45.0003],
    widthMetres: 400,
  },
];
