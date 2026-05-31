# Kịch bản TLS — Software engineer (crew shot list)

**Đối tượng:** Software engineer · **Thời lượng:** ~20s (600 frame @ 30 fps)  
**Pipeline:** Director → Art Director → Storyboard → Motion → Render (`docs/tls-crew-walkthrough.md`)  
**SceneSpec:** `src/fixtures/tls-production-scene-spec.json` · **Seed:** `tls-production-seed-005`

---

## Không gian cảnh (một lần thiết lập)

```
                    [sniffer]  ← chỉ beat 1 (frame 0–89)
                        │
         cleartext ─────┼───── (y cao, đỏ) nghe lén
                        │
    [browser] ══════════╪══════════ [origin]
       x=-4          link wire      x=4
                        │
              handshake trên wire (y≈0.25)
                        │
              tunnel secure (y≈0, ống ngang)
                        │
              app data trong tunnel (y≈-0.25, cyan)
```

| Vai | Actor id | Vị trí 3D | Màu marker |
|-----|----------|-----------|------------|
| Browser | `actor-client` | x = -4 | data (xanh lá) |
| Origin server | `actor-server` | x = 4 | trust (vàng) |
| Sniffer | `actor-attacker` | x = 0, cao | threat (đỏ) — **ẩn sau hook** |

**Thanh link:** hộp mỏng nối browser ↔ origin — lưu lượng “trên đường dây”.  
**Nhãn gói:** `messageType` từ timeline (ClientHello, …) billboard trên sphere.  
**Phụ đề:** `scriptIntent` burn-in đáy frame.

---

## Bảng shot (Storyboard + Motion)

| Beat | Retention | Frame | Gói / nhãn | Đường đi (ý nghĩa) | Module | Art tokens |
|------|-----------|-------|------------|-------------------|--------|------------|
| `tls-hook` | p25 | 0–89 | `plaintext-exposure` · đỏ | **Trên** link, qua sniffer — ai trên path đọc được | `viz-packet-threat` | `--color-accent-threat`, `--light-threat-pulse` |
| `tls-client-hello-beat` | p50 | 90–209 | `ClientHello` | Browser → origin **trên wire** — đàm phán, chưa secret | `viz-packet-flow`, `viz-tunnel-handshake` | `--color-accent-data`, wireframe tunnel |
| `tls-server-hello-beat` | p50 | 210–329 | `ServerHello` + **Certificate** | Origin → browser; cert tại **x≈3.5** (gần origin) | `viz-cert-single`, handshake | `--color-accent-trust`, intimate FOV |
| `tls-finished-beat` | p75 | 330–449 | `Finished` | Trao khóa **giữa** hai đầu; tunnel **đặc** bật | `viz-tunnel-secure` | `--color-accent-cyan` |
| `tls-app-data-beat` | completion | 450–599 | `ApplicationData` | Trong tunnel (**y thấp hơn** wire) — payload thật | `viz-packet-encrypted`, tunnel | cyan encrypted |

**Quy tắc đạo diễn:** mỗi beat **một gói**, một hướng rõ, sniffer không xuất hiện sau hook (tránh nhầm “vẫn đang tấn công”).

---

## Phụ đề + voice (khớp `contract.json`)

| Beat | Burn-in (`scriptIntent`) |
|------|--------------------------|
| hook | Chưa TLS — cleartext trên mạng không tin cậy có thể bị sniff. |
| client hello | ClientHello: version, cipher suites, extensions — chưa gửi secret ứng dụng. |
| server hello | ServerHello + certificate — trust do client validate, chưa khẳng định trên hình. |
| finished | Finished — khóa phiên và record layer AEAD; kênh bí mật sẵn sàng. |
| app data | Application Data — HTTP/API trong tunnel; ngoài path không đọc được payload. |

**CTA:** 🔒 = transport encrypted — vẫn cần kiểm hostname, cert, và ứng dụng.

---

## Beat notes (hình + lời)

### 1 — Hook (0–3s)

- **Ý hình:** Sniffer + gói đỏ bay **phía trên** link — metadata/password chưa mã hóa lộ trên path.
- **Không có** tunnel; chỉ browser, origin, sniffer.

### 2 — ClientHello (3–7s)

- **Ý hình:** Một gói có nhãn `ClientHello` chạy trái → phải **sát link**; tunnel wireframe = handshake đang mở.
- Sniffer **đã biến mất**.

### 3 — ServerHello (7–11s)

- **Ý hình:** Gói `ServerHello` phải → trái; khối **Certificate** bên origin (không tô “trusted” sớm).

### 4 — Finished (11–15s)

- **Ý hình:** Gói nhỏ giữa sân; ống tunnel **đặc** (secure) — kênh record layer sẵn sàng.

### 5 — Application Data (15–20s)

- **Ý hình:** Gói cyan **dưới** mặt wire, trong ống — HTTP/API sau handshake.

---

## Render

```bash
unset SECURITY_LAB_RENDER_BACKEND
unset SECURITY_LAB_INCLUDE_NARRATION
npm run test -- tests/tls-production-export.test.ts --testNamePattern="default env export"
```

- MP4: `.artifacts/production/tls/tls-production.mp4`
- Debug: `.artifacts/production/tls/debug-frame-150-caption.png` (ClientHello + nhãn gói)
