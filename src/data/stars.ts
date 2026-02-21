/**
 * 별 및 별자리 데이터
 * 
 * 좌표 출처: Yale Bright Star Catalogue (BSC5) / SIMBAD / NASA HEASARC
 * RA = 적경 (시간 단위, 0~24h)
 * Dec = 적위 (도 단위, -90°~+90°)
 * mag = 겉보기 등급 (밝을수록 작은 값)
 * 
 * 별자리 연결선: IAU/Sky & Telescope 표준 stick figure 기반
 * 시스템 부하를 줄이기 위해 mag ≤ 3.5 급 밝은 별 위주로 선별
 */

export interface Star {
    name: string
    ra: number   // hours (0-24)
    dec: number  // degrees (-90 to +90)
    mag: number  // apparent magnitude
}

export interface Constellation {
    name: string
    lines: [string, string][]
}

// ─────────────────────────────────────────────
// 밝은 별 카탈로그 (Yale BSC / SIMBAD 기준 J2000.0)
// ─────────────────────────────────────────────
export const STARS: Star[] = [
    // ════ 1등성 이상 (Navigation Stars) ════
    { name: 'Sirius', ra: 6.752, dec: -16.72, mag: -1.46 },  // α CMa
    { name: 'Canopus', ra: 6.399, dec: -52.70, mag: -0.72 },  // α Car
    { name: 'Rigil Kent', ra: 14.660, dec: -60.83, mag: -0.01 },  // α Cen
    { name: 'Arcturus', ra: 14.261, dec: 19.18, mag: -0.05 },  // α Boo
    { name: 'Vega', ra: 18.616, dec: 38.78, mag: 0.03 },   // α Lyr
    { name: 'Capella', ra: 5.278, dec: 46.00, mag: 0.08 },   // α Aur
    { name: 'Rigel', ra: 5.242, dec: -8.20, mag: 0.12 },   // β Ori
    { name: 'Procyon', ra: 7.655, dec: 5.22, mag: 0.38 },   // α CMi
    { name: 'Betelgeuse', ra: 5.919, dec: 7.41, mag: 0.50 },   // α Ori
    { name: 'Achernar', ra: 1.629, dec: -57.24, mag: 0.46 },   // α Eri
    { name: 'Hadar', ra: 14.064, dec: -60.37, mag: 0.61 },   // β Cen
    { name: 'Altair', ra: 19.846, dec: 8.87, mag: 0.77 },   // α Aql
    { name: 'Acrux', ra: 12.443, dec: -63.10, mag: 0.77 },   // α Cru
    { name: 'Aldebaran', ra: 4.599, dec: 16.51, mag: 0.85 },   // α Tau
    { name: 'Spica', ra: 13.420, dec: -11.16, mag: 0.98 },   // α Vir
    { name: 'Antares', ra: 16.490, dec: -26.43, mag: 1.06 },   // α Sco
    { name: 'Pollux', ra: 7.755, dec: 28.03, mag: 1.14 },   // β Gem
    { name: 'Fomalhaut', ra: 22.961, dec: -29.62, mag: 1.16 },   // α PsA
    { name: 'Deneb', ra: 20.690, dec: 45.28, mag: 1.25 },   // α Cyg
    { name: 'Mimosa', ra: 12.795, dec: -59.69, mag: 1.25 },   // β Cru
    { name: 'Regulus', ra: 10.140, dec: 11.97, mag: 1.36 },   // α Leo
    { name: 'Adhara', ra: 6.977, dec: -28.97, mag: 1.50 },   // ε CMa
    { name: 'Castor', ra: 7.577, dec: 31.89, mag: 1.58 },   // α Gem
    { name: 'Shaula', ra: 17.560, dec: -37.10, mag: 1.62 },   // λ Sco
    { name: 'Bellatrix', ra: 5.419, dec: 6.35, mag: 1.64 },   // γ Ori
    { name: 'Gacrux', ra: 12.519, dec: -57.11, mag: 1.64 },   // γ Cru

    // ════ 2등성대 ════
    // Orion (오리온)
    { name: 'Alnilam', ra: 5.604, dec: -1.20, mag: 1.69 },   // ε Ori
    { name: 'Alnitak', ra: 5.679, dec: -1.94, mag: 1.74 },   // ζ Ori
    { name: 'Mintaka', ra: 5.533, dec: -0.30, mag: 2.25 },   // δ Ori
    { name: 'Saiph', ra: 5.796, dec: -9.67, mag: 2.07 },   // κ Ori

    // Ursa Major (큰곰 / 북두칠성)
    { name: 'Alioth', ra: 12.900, dec: 55.96, mag: 1.76 },   // ε UMa
    { name: 'Dubhe', ra: 11.062, dec: 61.75, mag: 1.79 },   // α UMa
    { name: 'Alkaid', ra: 13.793, dec: 49.31, mag: 1.85 },   // η UMa
    { name: 'Mizar', ra: 13.399, dec: 54.93, mag: 2.23 },   // ζ UMa
    { name: 'Merak', ra: 11.031, dec: 56.38, mag: 2.37 },   // β UMa
    { name: 'Phecda', ra: 11.897, dec: 53.69, mag: 2.44 },   // γ UMa
    { name: 'Megrez', ra: 12.257, dec: 57.03, mag: 3.31 },   // δ UMa

    // Cassiopeia (카시오페이아)
    { name: 'Schedar', ra: 0.675, dec: 56.54, mag: 2.24 },   // α Cas
    { name: 'Caph', ra: 0.153, dec: 59.15, mag: 2.27 },   // β Cas
    { name: 'Tsih', ra: 0.945, dec: 60.72, mag: 2.15 },   // γ Cas
    { name: 'Ruchbah', ra: 1.430, dec: 60.24, mag: 2.66 },   // δ Cas
    { name: 'Segin', ra: 1.907, dec: 63.67, mag: 3.37 },   // ε Cas

    // Polaris / Ursa Minor (작은곰)
    { name: 'Polaris', ra: 2.530, dec: 89.26, mag: 1.97 },   // α UMi
    { name: 'Kochab', ra: 14.845, dec: 74.16, mag: 2.07 },   // β UMi
    { name: 'Pherkad', ra: 15.345, dec: 71.83, mag: 3.00 },   // γ UMi
    { name: 'Yildun', ra: 17.537, dec: 86.59, mag: 4.35 },   // δ UMi
    { name: 'UMi-Eps', ra: 16.766, dec: 82.04, mag: 4.21 },   // ε UMi
    { name: 'UMi-Zeta', ra: 15.734, dec: 77.79, mag: 4.29 },   // ζ UMi
    { name: 'UMi-Eta', ra: 16.292, dec: 75.76, mag: 4.95 },   // η UMi

    // Cygnus (백조)
    { name: 'Sadr', ra: 20.370, dec: 40.26, mag: 2.23 },   // γ Cyg
    { name: 'Gienah Cyg', ra: 20.770, dec: 33.97, mag: 2.48 },   // ε Cyg
    { name: 'Albireo', ra: 19.512, dec: 27.96, mag: 3.05 },   // β Cyg
    { name: 'Cyg-Delta', ra: 19.750, dec: 45.13, mag: 2.87 },   // δ Cyg

    // Lyra (거문고)
    { name: 'Sheliak', ra: 18.835, dec: 33.36, mag: 3.52 },   // β Lyr
    { name: 'Sulafat', ra: 18.982, dec: 32.69, mag: 3.25 },   // γ Lyr

    // Aquila (독수리)
    { name: 'Tarazed', ra: 19.771, dec: 10.61, mag: 2.72 },   // γ Aql
    { name: 'Alshain', ra: 19.922, dec: 6.41, mag: 3.71 },   // β Aql

    // Leo (사자)
    { name: 'Algieba', ra: 10.333, dec: 19.84, mag: 2.01 },   // γ Leo
    { name: 'Denebola', ra: 11.818, dec: 14.57, mag: 2.14 },   // β Leo
    { name: 'Zosma', ra: 11.235, dec: 20.52, mag: 2.56 },   // δ Leo
    { name: 'Chertan', ra: 11.237, dec: 15.43, mag: 3.33 },   // θ Leo
    { name: 'Algenubi', ra: 9.764, dec: 11.97, mag: 2.98 },   // ε Leo
    { name: 'Rasalas', ra: 9.879, dec: 26.01, mag: 3.88 },   // μ Leo
    { name: 'Adhafera', ra: 10.278, dec: 23.42, mag: 3.43 },   // ζ Leo

    // Scorpius (전갈)
    { name: 'Dschubba', ra: 16.005, dec: -22.62, mag: 2.29 },   // δ Sco
    { name: 'Sargas', ra: 17.622, dec: -42.99, mag: 1.87 },   // θ Sco
    { name: 'Graffias', ra: 16.091, dec: -19.81, mag: 2.56 },   // β Sco
    { name: 'Fang', ra: 15.981, dec: -26.11, mag: 3.87 },   // π Sco
    { name: 'Alniyat', ra: 16.353, dec: -25.59, mag: 2.89 },   // σ Sco
    { name: 'Lesath', ra: 17.530, dec: -37.29, mag: 2.70 },   // υ Sco
    { name: 'Sco-Eps', ra: 16.836, dec: -34.29, mag: 2.29 },   // ε Sco
    { name: 'Sco-Mu1', ra: 16.865, dec: -38.05, mag: 3.00 },   // μ1 Sco
    { name: 'Sco-Zeta2', ra: 16.899, dec: -42.36, mag: 3.62 },   // ζ2 Sco
    { name: 'Sco-Eta', ra: 17.202, dec: -43.24, mag: 3.32 },   // η Sco
    { name: 'Sco-Kappa', ra: 17.709, dec: -39.03, mag: 2.41 },   // κ Sco
    { name: 'Sco-Iota1', ra: 17.793, dec: -40.13, mag: 3.03 },   // ι1 Sco

    // Sagittarius (궁수 – Teapot)
    { name: 'Kaus Aust', ra: 18.403, dec: -34.38, mag: 1.79 },   // ε Sgr
    { name: 'Nunki', ra: 18.921, dec: -26.30, mag: 2.05 },   // σ Sgr
    { name: 'Ascella', ra: 19.043, dec: -29.88, mag: 2.60 },   // ζ Sgr
    { name: 'Kaus Media', ra: 18.350, dec: -29.83, mag: 2.72 },   // δ Sgr
    { name: 'Kaus Bor', ra: 18.229, dec: -25.42, mag: 2.82 },   // λ Sgr
    { name: 'Sgr-Phi', ra: 18.761, dec: -26.99, mag: 3.17 },   // φ Sgr
    { name: 'Sgr-Tau', ra: 19.116, dec: -27.67, mag: 3.32 },   // τ Sgr
    { name: 'Sgr-Gamma', ra: 18.097, dec: -30.42, mag: 2.98 },   // γ Sgr

    // Taurus (황소)
    { name: 'Elnath', ra: 5.438, dec: 28.61, mag: 1.65 },   // β Tau
    { name: 'Tau-Zeta', ra: 5.627, dec: 21.14, mag: 3.00 },   // ζ Tau
    { name: 'Tau-Theta2', ra: 4.477, dec: 15.87, mag: 3.40 },   // θ2 Tau (Hyades)
    { name: 'Tau-Gamma', ra: 4.330, dec: 15.63, mag: 3.65 },   // γ Tau
    { name: 'Tau-Epsilon', ra: 4.477, dec: 19.18, mag: 3.53 },   // ε Tau
    { name: 'Tau-Lambda', ra: 4.011, dec: 12.49, mag: 3.47 },   // λ Tau

    // Gemini (쌍둥이)
    { name: 'Alhena', ra: 6.629, dec: 16.40, mag: 1.93 },   // γ Gem
    { name: 'Gem-Mu', ra: 6.383, dec: 22.51, mag: 2.87 },   // μ Gem
    { name: 'Gem-Eps', ra: 6.732, dec: 25.13, mag: 2.98 },   // ε Gem
    { name: 'Mebsuta', ra: 6.732, dec: 25.13, mag: 2.98 },   // ε Gem alias
    { name: 'Gem-Xi', ra: 6.754, dec: 12.90, mag: 3.35 },   // ξ Gem
    { name: 'Gem-Delta', ra: 7.336, dec: 21.98, mag: 3.53 },   // δ Gem

    // Canis Major (큰개)
    { name: 'Wezen', ra: 7.140, dec: -26.39, mag: 1.83 },   // δ CMa
    { name: 'Mirzam', ra: 6.378, dec: -17.96, mag: 1.98 },   // β CMa
    { name: 'Aludra', ra: 7.402, dec: -29.30, mag: 2.45 },   // η CMa
    { name: 'Furud', ra: 6.338, dec: -30.06, mag: 3.02 },   // ζ CMa

    // Perseus
    { name: 'Mirphak', ra: 3.405, dec: 49.86, mag: 1.79 },   // α Per
    { name: 'Algol', ra: 3.136, dec: 40.96, mag: 2.12 },   // β Per
    { name: 'Per-Zeta', ra: 3.902, dec: 31.88, mag: 2.84 },   // ζ Per
    { name: 'Per-Eps', ra: 3.964, dec: 40.01, mag: 2.90 },   // ε Per
    { name: 'Per-Delta', ra: 3.715, dec: 47.79, mag: 3.01 },   // δ Per
    { name: 'Per-Gamma', ra: 3.080, dec: 53.51, mag: 2.93 },   // γ Per

    // Auriga (마차부)
    { name: 'Menkalinan', ra: 5.992, dec: 44.95, mag: 1.90 },   // β Aur
    { name: 'Aur-Theta', ra: 5.995, dec: 37.21, mag: 2.62 },   // θ Aur
    { name: 'Hassaleh', ra: 4.950, dec: 33.17, mag: 2.69 },   // ι Aur

    // Crux (남십자)
    { name: 'Imai', ra: 12.252, dec: -58.75, mag: 1.59 },   // δ Cru

    // Centaurus (켄타우루스)
    { name: 'Menkent', ra: 14.111, dec: -36.37, mag: 2.06 },   // θ Cen
    { name: 'Cen-Gamma', ra: 12.692, dec: -48.96, mag: 2.17 },   // γ Cen
    { name: 'Cen-Eps', ra: 13.665, dec: -53.47, mag: 2.30 },   // ε Cen
    { name: 'Cen-Eta', ra: 14.592, dec: -42.16, mag: 2.33 },   // η Cen
    { name: 'Cen-Zeta', ra: 13.926, dec: -47.29, mag: 2.55 },   // ζ Cen

    // Virgo (처녀) – additional stars
    { name: 'Porrima', ra: 12.694, dec: -1.45, mag: 2.74 },   // γ Vir
    { name: 'Vindemiatrix', ra: 13.036, dec: 10.96, mag: 2.83 },   // ε Vir
    { name: 'Vir-Zeta', ra: 13.578, dec: -0.60, mag: 3.37 },   // ζ Vir

    // Bootes (목동)
    { name: 'Izar', ra: 14.750, dec: 27.07, mag: 2.35 },   // ε Boo
    { name: 'Muphrid', ra: 13.912, dec: 18.40, mag: 2.68 },   // η Boo
    { name: 'Boo-Gamma', ra: 14.534, dec: 38.31, mag: 3.04 },   // γ Boo
    { name: 'Boo-Delta', ra: 15.258, dec: 33.31, mag: 3.46 },   // δ Boo
    { name: 'Boo-Beta', ra: 15.032, dec: 40.39, mag: 3.49 },   // β Boo (Nekkar)

    // Corona Borealis (북쪽왕관)
    { name: 'Alphecca', ra: 15.578, dec: 26.71, mag: 2.22 },   // α CrB
    { name: 'CrB-Beta', ra: 15.464, dec: 29.11, mag: 3.66 },   // β CrB

    // Pegasus (페가수스)
    { name: 'Enif', ra: 21.736, dec: 9.88, mag: 2.38 },   // ε Peg
    { name: 'Markab', ra: 23.079, dec: 15.21, mag: 2.49 },   // α Peg
    { name: 'Scheat', ra: 23.063, dec: 28.08, mag: 2.44 },   // β Peg
    { name: 'Algenib', ra: 0.220, dec: 15.18, mag: 2.83 },   // γ Peg

    // Andromeda (안드로메다)
    { name: 'Alpheratz', ra: 0.140, dec: 29.09, mag: 2.07 },   // α And
    { name: 'Mirach', ra: 1.163, dec: 35.62, mag: 2.07 },   // β And
    { name: 'Almach', ra: 2.065, dec: 42.33, mag: 2.10 },   // γ And

    // Aries (양)
    { name: 'Hamal', ra: 2.120, dec: 23.46, mag: 2.00 },   // α Ari
    { name: 'Sheratan', ra: 1.911, dec: 20.81, mag: 2.64 },   // β Ari

    // Pisces (물고기) – brightest
    { name: 'Psc-Eta', ra: 1.525, dec: 15.35, mag: 3.62 },   // η Psc

    // Aquarius (물병)
    { name: 'Sadalsuud', ra: 21.526, dec: -5.57, mag: 2.90 },   // β Aqr
    { name: 'Sadalmelik', ra: 22.096, dec: -0.32, mag: 2.95 },   // α Aqr

    // Draco (용)
    { name: 'Eltanin', ra: 17.943, dec: 51.49, mag: 2.24 },   // γ Dra
    { name: 'Rastaban', ra: 17.507, dec: 52.30, mag: 2.79 },   // β Dra
    { name: 'Dra-Delta', ra: 19.209, dec: 67.66, mag: 3.07 },   // δ Dra
    { name: 'Dra-Zeta', ra: 17.146, dec: 65.71, mag: 3.17 },   // ζ Dra
    { name: 'Dra-Eta', ra: 16.400, dec: 61.51, mag: 2.73 },   // η Dra
    { name: 'Dra-Iota', ra: 15.415, dec: 58.97, mag: 3.29 },   // ι Dra
    { name: 'Thuban', ra: 14.073, dec: 64.38, mag: 3.67 },   // α Dra

    // Cepheus (케페우스)
    { name: 'Alderamin', ra: 21.310, dec: 62.59, mag: 2.45 },   // α Cep
    { name: 'Cep-Beta', ra: 21.478, dec: 70.56, mag: 3.23 },   // β Cep
    { name: 'Cep-Gamma', ra: 23.656, dec: 77.63, mag: 3.21 },   // γ Cep
    { name: 'Cep-Zeta', ra: 22.181, dec: 58.20, mag: 3.35 },   // ζ Cep
    { name: 'Cep-Iota', ra: 22.828, dec: 66.20, mag: 3.50 },   // ι Cep

    // Ophiuchus (뱀주인)
    { name: 'Rasalhague', ra: 17.582, dec: 12.56, mag: 2.08 },   // α Oph
    { name: 'Oph-Beta', ra: 17.725, dec: 4.57, mag: 2.77 },   // β Oph
    { name: 'Oph-Eta', ra: 17.173, dec: -15.72, mag: 2.43 },   // η Oph

    // Hercules (헤라클레스) – keystone
    { name: 'Kornephoros', ra: 16.504, dec: 21.49, mag: 2.78 },   // β Her
    { name: 'Her-Zeta', ra: 16.688, dec: 31.60, mag: 2.81 },   // ζ Her
    { name: 'Her-Eta', ra: 16.715, dec: 38.92, mag: 3.48 },   // η Her
    { name: 'Her-Pi', ra: 17.251, dec: 36.81, mag: 3.16 },   // π Her
    { name: 'Her-Eps', ra: 17.005, dec: 30.93, mag: 3.92 },   // ε Her

    // Libra (천칭)
    { name: 'Zubenelgenubi', ra: 14.848, dec: -16.04, mag: 2.75 },  // α Lib
    { name: 'Zubeneschamali', ra: 15.283, dec: -9.38, mag: 2.61 },  // β Lib

    // Capricornus (염소)
    { name: 'Deneb Algedi', ra: 21.784, dec: -16.13, mag: 2.85 },   // δ Cap
    { name: 'Dabih', ra: 20.350, dec: -14.78, mag: 3.05 },   // β Cap

    // Piscis Austrinus (남쪽물고기)
    // Fomalhaut already included

    // Grus (두루미)
    { name: 'Alnair', ra: 22.137, dec: -46.96, mag: 1.73 },   // α Gru

    // Carina (용골)
    { name: 'Avior', ra: 8.375, dec: -59.51, mag: 1.86 },   // ε Car
    { name: 'Miaplacidus', ra: 9.220, dec: -69.72, mag: 1.67 },   // β Car

    // Puppis (고물)
    { name: 'Naos', ra: 8.059, dec: -40.00, mag: 2.21 },   // ζ Pup

    // Vela (돛)
    { name: 'Vel-Gamma', ra: 8.159, dec: -47.34, mag: 1.75 },   // γ Vel
    { name: 'Vel-Delta', ra: 8.745, dec: -54.71, mag: 1.96 },   // δ Vel
    { name: 'Vel-Kappa', ra: 9.368, dec: -55.01, mag: 2.47 },   // κ Vel
    { name: 'Vel-Lambda', ra: 9.133, dec: -43.43, mag: 2.23 },   // λ Vel

    // Eridanus (에리다누스) – partial, bright stars only
    { name: 'Cursa', ra: 5.131, dec: -5.09, mag: 2.78 },   // β Eri
    { name: 'Zaurak', ra: 3.967, dec: -13.51, mag: 2.97 },   // γ Eri

    // Lupus (이리)
    { name: 'Lup-Alpha', ra: 14.699, dec: -47.39, mag: 2.30 },   // α Lup
    { name: 'Lup-Beta', ra: 14.976, dec: -43.13, mag: 2.68 },   // β Lup

    // Corvus (까마귀)
    { name: 'Gienah Crv', ra: 12.263, dec: -17.54, mag: 2.58 },   // γ Crv
    { name: 'Crv-Beta', ra: 12.573, dec: -23.40, mag: 2.65 },   // β Crv
    { name: 'Crv-Delta', ra: 12.497, dec: -16.52, mag: 2.94 },   // δ Crv
    { name: 'Crv-Eps', ra: 12.170, dec: -22.62, mag: 3.02 },   // ε Crv

    // Crater (컵) – just brightest
    { name: 'Crt-Delta', ra: 11.322, dec: -14.78, mag: 3.56 },   // δ Crt

    // Canis Minor (작은개)
    { name: 'Gomeisa', ra: 7.453, dec: 8.29, mag: 2.89 },   // β CMi

    // Hydra – brightest
    { name: 'Alphard', ra: 9.460, dec: -8.66, mag: 1.99 },   // α Hya

    // Triangulum (삼각형)
    { name: 'Tri-Alpha', ra: 1.885, dec: 29.58, mag: 3.41 },   // α Tri
    { name: 'Tri-Beta', ra: 2.159, dec: 34.99, mag: 3.00 },   // β Tri
    { name: 'Tri-Gamma', ra: 2.289, dec: 33.85, mag: 4.01 },   // γ Tri
]

// ─────────────────────────────────────────────
// 별자리 연결선 (IAU/Sky & Telescope 표준 stick figure)
// 각 항목은 두 별 이름을 연결하는 선분
// ─────────────────────────────────────────────
export const CONSTELLATIONS: Constellation[] = [
    {
        name: 'Orion (오리온)',
        lines: [
            ['Betelgeuse', 'Bellatrix'],
            ['Bellatrix', 'Mintaka'],
            ['Mintaka', 'Alnilam'],
            ['Alnilam', 'Alnitak'],
            ['Alnitak', 'Saiph'],
            ['Saiph', 'Rigel'],
            ['Rigel', 'Mintaka'],
            ['Betelgeuse', 'Alnitak'],
        ]
    },
    {
        name: 'Ursa Major (큰곰)',
        lines: [
            ['Dubhe', 'Merak'],
            ['Merak', 'Phecda'],
            ['Phecda', 'Megrez'],
            ['Megrez', 'Dubhe'],
            ['Megrez', 'Alioth'],
            ['Alioth', 'Mizar'],
            ['Mizar', 'Alkaid'],
        ]
    },
    {
        name: 'Ursa Minor (작은곰)',
        lines: [
            ['Polaris', 'Yildun'],
            ['Yildun', 'UMi-Eps'],
            ['UMi-Eps', 'UMi-Zeta'],
            ['UMi-Zeta', 'Kochab'],
            ['Kochab', 'Pherkad'],
            ['Pherkad', 'UMi-Zeta'],
            ['UMi-Zeta', 'UMi-Eta'],
        ]
    },
    {
        name: 'Cassiopeia (카시오페이아)',
        lines: [
            ['Caph', 'Schedar'],
            ['Schedar', 'Tsih'],
            ['Tsih', 'Ruchbah'],
            ['Ruchbah', 'Segin'],
        ]
    },
    {
        name: 'Cygnus (백조)',
        lines: [
            ['Deneb', 'Sadr'],
            ['Sadr', 'Albireo'],
            ['Sadr', 'Gienah Cyg'],
            ['Sadr', 'Cyg-Delta'],
        ]
    },
    {
        name: 'Lyra (거문고)',
        lines: [
            ['Vega', 'Sheliak'],
            ['Sheliak', 'Sulafat'],
            ['Sulafat', 'Vega'],
        ]
    },
    {
        name: 'Aquila (독수리)',
        lines: [
            ['Altair', 'Tarazed'],
            ['Altair', 'Alshain'],
        ]
    },
    {
        name: 'Leo (사자)',
        lines: [
            ['Regulus', 'Algieba'],
            ['Algieba', 'Adhafera'],
            ['Adhafera', 'Rasalas'],
            ['Regulus', 'Chertan'],
            ['Chertan', 'Zosma'],
            ['Zosma', 'Denebola'],
            ['Zosma', 'Algieba'],
            ['Regulus', 'Algenubi'],
        ]
    },
    {
        name: 'Scorpius (전갈)',
        lines: [
            ['Graffias', 'Dschubba'],
            ['Dschubba', 'Antares'],
            ['Antares', 'Alniyat'],
            ['Alniyat', 'Sco-Eps'],
            ['Sco-Eps', 'Sco-Mu1'],
            ['Sco-Mu1', 'Sco-Zeta2'],
            ['Sco-Zeta2', 'Sco-Eta'],
            ['Sco-Eta', 'Sargas'],
            ['Sargas', 'Sco-Kappa'],
            ['Sco-Kappa', 'Sco-Iota1'],
            ['Sco-Iota1', 'Shaula'],
            ['Shaula', 'Lesath'],
        ]
    },
    {
        name: 'Sagittarius (궁수 – 주전자)',
        lines: [
            // Teapot
            ['Kaus Aust', 'Kaus Media'],
            ['Kaus Media', 'Kaus Bor'],
            ['Kaus Bor', 'Sgr-Phi'],
            ['Sgr-Phi', 'Nunki'],
            ['Nunki', 'Sgr-Tau'],
            ['Sgr-Tau', 'Ascella'],
            ['Ascella', 'Kaus Aust'],
            ['Kaus Media', 'Sgr-Gamma'],
            ['Ascella', 'Sgr-Phi'],
        ]
    },
    {
        name: 'Taurus (황소)',
        lines: [
            ['Aldebaran', 'Tau-Theta2'],
            ['Tau-Theta2', 'Tau-Gamma'],
            ['Tau-Gamma', 'Tau-Lambda'],
            ['Aldebaran', 'Tau-Epsilon'],
            ['Tau-Epsilon', 'Elnath'],
            ['Aldebaran', 'Tau-Zeta'],
        ]
    },
    {
        name: 'Gemini (쌍둥이)',
        lines: [
            ['Castor', 'Pollux'],
            ['Castor', 'Gem-Mu'],
            ['Gem-Mu', 'Gem-Eps'],
            ['Pollux', 'Gem-Delta'],
            ['Gem-Delta', 'Gem-Xi'],
            ['Gem-Xi', 'Alhena'],
        ]
    },
    {
        name: 'Canis Major (큰개)',
        lines: [
            ['Sirius', 'Mirzam'],
            ['Sirius', 'Adhara'],
            ['Adhara', 'Furud'],
            ['Adhara', 'Wezen'],
            ['Wezen', 'Aludra'],
        ]
    },
    {
        name: 'Crux (남십자)',
        lines: [
            ['Acrux', 'Gacrux'],
            ['Mimosa', 'Imai'],
        ]
    },
    {
        name: 'Centaurus (켄타우루스)',
        lines: [
            ['Rigil Kent', 'Hadar'],
            ['Hadar', 'Cen-Eps'],
            ['Cen-Eps', 'Cen-Zeta'],
            ['Cen-Zeta', 'Cen-Eta'],
            ['Cen-Eta', 'Menkent'],
            ['Cen-Gamma', 'Cen-Eps'],
        ]
    },
    {
        name: 'Perseus (페르세우스)',
        lines: [
            ['Mirphak', 'Per-Delta'],
            ['Per-Delta', 'Per-Gamma'],
            ['Mirphak', 'Per-Eps'],
            ['Per-Eps', 'Per-Zeta'],
            ['Mirphak', 'Algol'],
        ]
    },
    {
        name: 'Auriga (마차부)',
        lines: [
            ['Capella', 'Menkalinan'],
            ['Menkalinan', 'Aur-Theta'],
            ['Aur-Theta', 'Hassaleh'],
            ['Hassaleh', 'Elnath'],
            ['Capella', 'Hassaleh'],
        ]
    },
    {
        name: 'Pegasus (페가수스)',
        lines: [
            // Great Square
            ['Markab', 'Scheat'],
            ['Scheat', 'Alpheratz'],
            ['Alpheratz', 'Algenib'],
            ['Algenib', 'Markab'],
            ['Markab', 'Enif'],
        ]
    },
    {
        name: 'Andromeda (안드로메다)',
        lines: [
            ['Alpheratz', 'Mirach'],
            ['Mirach', 'Almach'],
        ]
    },
    {
        name: 'Draco (용)',
        lines: [
            ['Eltanin', 'Rastaban'],
            ['Rastaban', 'Dra-Zeta'],
            ['Dra-Zeta', 'Dra-Eta'],
            ['Dra-Eta', 'Dra-Iota'],
            ['Dra-Iota', 'Thuban'],
            ['Dra-Zeta', 'Dra-Delta'],
        ]
    },
    {
        name: 'Cepheus (케페우스)',
        lines: [
            ['Alderamin', 'Cep-Zeta'],
            ['Cep-Zeta', 'Cep-Iota'],
            ['Cep-Iota', 'Cep-Gamma'],
            ['Cep-Gamma', 'Cep-Beta'],
            ['Cep-Beta', 'Alderamin'],
        ]
    },
    {
        name: 'Bootes (목동)',
        lines: [
            ['Arcturus', 'Izar'],
            ['Izar', 'Boo-Delta'],
            ['Boo-Delta', 'Boo-Beta'],
            ['Boo-Beta', 'Boo-Gamma'],
            ['Boo-Gamma', 'Izar'],
            ['Arcturus', 'Muphrid'],
        ]
    },
    {
        name: 'Corona Borealis (북쪽왕관)',
        lines: [
            ['Alphecca', 'CrB-Beta'],
        ]
    },
    {
        name: 'Virgo (처녀)',
        lines: [
            ['Spica', 'Porrima'],
            ['Porrima', 'Vindemiatrix'],
            ['Spica', 'Vir-Zeta'],
        ]
    },
    {
        name: 'Hercules (헤라클레스)',
        lines: [
            ['Kornephoros', 'Her-Zeta'],
            ['Her-Zeta', 'Her-Eta'],
            ['Her-Eta', 'Her-Pi'],
            ['Her-Pi', 'Her-Eps'],
            ['Her-Eps', 'Her-Zeta'],
        ]
    },
    {
        name: 'Ophiuchus (뱀주인)',
        lines: [
            ['Rasalhague', 'Oph-Beta'],
            ['Oph-Beta', 'Oph-Eta'],
        ]
    },
    {
        name: 'Libra (천칭)',
        lines: [
            ['Zubenelgenubi', 'Zubeneschamali'],
        ]
    },
    {
        name: 'Corvus (까마귀)',
        lines: [
            ['Gienah Crv', 'Crv-Beta'],
            ['Crv-Beta', 'Crv-Eps'],
            ['Crv-Eps', 'Crv-Delta'],
            ['Crv-Delta', 'Gienah Crv'],
        ]
    },
    {
        name: 'Aries (양)',
        lines: [
            ['Hamal', 'Sheratan'],
        ]
    },
    {
        name: 'Canis Minor (작은개)',
        lines: [
            ['Procyon', 'Gomeisa'],
        ]
    },
    {
        name: 'Vela (돛)',
        lines: [
            ['Vel-Gamma', 'Vel-Delta'],
            ['Vel-Delta', 'Vel-Kappa'],
            ['Vel-Kappa', 'Vel-Lambda'],
            ['Vel-Lambda', 'Vel-Gamma'],
        ]
    },
    {
        name: 'Triangulum (삼각형)',
        lines: [
            ['Tri-Alpha', 'Tri-Beta'],
            ['Tri-Beta', 'Tri-Gamma'],
            ['Tri-Gamma', 'Tri-Alpha'],
        ]
    },
]
