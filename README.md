# KPI Dashboard (Google Sheets + Apps Script)

Dashboard KPI kantor modern (dark mode neon) yang membaca data langsung dari **Google Sheets** melalui **Google Apps Script Web App (JSON API)**.

## Fitur
- KPI Cards (Top 4)
- KPI Table (Target vs Actual)
- Division Table
- Search / Filter
- Export CSV (KPI & Division)
- Dark/Light Mode
- Manual Refresh

---

## Struktur File
- `index.html` → Dashboard siap hosting
- `Code.gs` → Apps Script API JSON untuk membaca Google Sheets

---

## 1) Setup Google Sheets
Buat Spreadsheet lalu buat **3 sheet** berikut:

### Sheet: `CONFIG`
| A (key) | B (value) |
|---|---|
| API_KEY | blesproduction-123 |

### Sheet: `KPI`
Header baris 1:
| kpi | unit | target | actual | delta | updated_at |

Contoh:
- Attendance Rate | % | 97 | 96.4 | 1.2 | 2026-01-22 09:00  
- SLA On-time | % | 95 | 93.1 | -0.6 | 2026-01-22 09:00  

### Sheet: `DIVISION`
Header baris 1:
| division | focus | score | target | updated_at |

Contoh:
- HR | Attendance & Training | 92 | 95 | 2026-01-22 09:00  
- Operations | SLA & Compliance | 89 | 92 | 2026-01-22 09:00  

---

## 2) Setup Apps Script (API JSON)
1. Masuk ke Spreadsheet Anda  
2. Klik: **Extensions → Apps Script**
3. Paste isi file `Code.gs`
4. Klik **Save**

### Deploy Web App
1. Klik **Deploy → New deployment**
2. Pilih **Web app**
3. Set:
   - Execute as: **Me**
   - Who has access: **Anyone with the link**
4. Klik Deploy → Copy **Web App URL**

---

## 3) Hubungkan Dashboard ke API
Buka file `index.html`, edit bagian ini:

```js
const API_URL = "https://script.google.com/macros/s/AKfycbxpKw-1UaTGAKVRSVkQMcynxvlQtWUWu0coo_bcpKI4hDRX_kdaTeoFq0TuiqQwQ5Q-/exec";
const API_KEY = "blesproduction-123";
