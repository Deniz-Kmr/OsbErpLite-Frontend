<div align="center">
  <p>
    <a href="#türkçe">🇹🇷 Türkçe</a> | <a href="#english">🇬🇧 English</a>
  </p>
</div>

---

<a id="türkçe"></a>

<div align="center">

# OsbErpLite Frontend

### Organize Sanayi Bölgesi ERP sistemi için Angular tabanlı modern SPA arayüzü

[Mimari](#tr-mimari) •
[Modüller](#tr-modüller) •
[Kurulum](#tr-kurulum) •
[Tasarım Sistemi](#tr-tasarım)

<br />

<img src="https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 22" />
<img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/RxJS-7-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS" />

<br />

<img src="https://img.shields.io/badge/Chart.js-4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
<img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />

<br />

<p>
  <img src="https://img.shields.io/badge/Components-Standalone-F59E0B?style=flat-square" alt="Standalone Components" />
  <img src="https://img.shields.io/badge/State-RxJS_BehaviorSubject-B7178C?style=flat-square" alt="RxJS State" />
  <img src="https://img.shields.io/badge/Auth-JWT-111827?style=flat-square" alt="JWT Auth" />
  <img src="https://img.shields.io/badge/Routing-Lazy_Loading-2563EB?style=flat-square" alt="Lazy Loading" />
  <img src="https://img.shields.io/badge/Theme-Dark_%2F_Light-6366F1?style=flat-square" alt="Dark/Light Theme" />
</p>

</div>

---

## 📖 Proje Hakkında

**OsbErpLite Frontend**, [OsbErpLite Backend](https://github.com/Deniz-Kmr/OsbErpLite) API'sine bağlanan modern SPA arayüzüdür. Stok, sipariş, iş ortağı, İK ve dashboard modüllerini tek bir panelde sunar.

Proje; **Angular 22**, **TypeScript Strict**, **Tailwind CSS** ve **RxJS** ile **Standalone Components** yaklaşımıyla geliştirilmiştir. NgModule kullanılmaz. State yönetimi servis + RxJS BehaviorSubject pattern'i ile sağlanır.

---

<a id="tr-modüller"></a>

## 🧭 Modüller

### Dashboard

- KPI kartları: Aktif Çalışan, Müşteri, Tedarikçi, Bekleyen Sipariş, Düşük Stok, Bekleyen İzin, Bekleyen Satın Alma, Bekleyen Satış
- Count-up animasyonlu sayı gösterimleri
- Aylık stok hareket bar chart (son 6 ay)
- Departman dağılımı doughnut chart
- Responsive grid: 4 → 2 → 1 kolon

### İş Ortakları (Business Partners)

- Müşteri, tedarikçi ve çift yönlü iş ortağı listesi
- Filtreleme: arama + tip filtresi
- CRUD: oluşturma, düzenleme, silme (rol bazlı)
- Cascade koruma toast mesajları

### Ürünler & Depolar (Products & Warehouses)

- Ürün CRUD: SKU, ad, birim fiyat, stok miktarı, depo ataması
- Depo CRUD: ad, lokasyon
- Stok hareketleri: read-only liste, tarih + tip filtresi

### Sipariş Yönetimi (Purchase & Sales Orders)

- Satın alma ve satış siparişleri
- Dinamik satır ekleme ile sipariş formu
- Lifecycle butonları: Draft → Approved → Completed / Rejected
- Status badge renk kodlaması
- Detay sayfası: sipariş bilgileri + ürün satırları

### İK Modülü (Human Resources)

- Departman ve pozisyon CRUD
- Çalışan CRUD: departman/pozisyon select, yönetici hiyerarşisi
- İzin talepleri: onay akışı (Pending → Approved / Rejected)
- Status badge ile durum gösterimi

### Admin Paneli

- Kullanıcı yönetimi: listeleme, oluşturma, düzenleme, silme
- Rol atama (Admin, Manager, Employee)
- Şifre sıfırlama
- SAP senkronizasyon tetikleme

### Auth (Kimlik Doğrulama)

- Login ve Register sayfaları
- JWT token yönetimi (access + refresh token rotation)
- Auto-attach interceptor
- 401 → refresh token retry
- Role-based route guard

---

## 🛠 Kullanılan Teknolojiler

| Alan | Teknoloji | Versiyon |
| --- | --- | --- |
| Framework | Angular (Standalone Components) | 22.x |
| Dil | TypeScript (Strict Mode) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Reactive | RxJS | 7.x |
| Grafikler | Chart.js | 4.x |
| Font (Display) | Plus Jakarta Sans | - |
| Font (Data) | JetBrains Mono | - |
| İkonlar | Phosphor Icons (Light) | - |
| Container | Docker (multi-stage) + Nginx | - |
| Linter | Prettier | - |

---

<a id="tr-mimari"></a>

## 🏗 Mimari

### Katman Yapısı

```
core/       → Singleton servisler, interceptor, guard, model (uygulama geneli)
shared/     → Reusable UI component, pipe, directive (modüller arası paylaşım)
features/   → Lazy-loaded feature modülleri (her modül bağımsız)
layout/     → Shell: sidebar, topbar, main content wrapper
```

### State Yönetimi

NgRx veya Redux kullanılmaz. Her feature servisinde:

```
Service (BehaviorSubject) → Component (async pipe) → Template
```

Bu yaklaşım bu ölçekteki proje için yeterlidir ve gereksiz boilerplate'i önler.

### Routing

Tüm feature modülleri lazy-loaded:

```typescript
{
  path: 'products',
  loadChildren: () =>
    import('./features/products/products.routes')
      .then(m => m.PRODUCT_ROUTES)
}
```

### Request Akışı

```
Component
  ↓
Feature Service (HttpClient)
  ↓
JWT Interceptor (auto-attach token)
  ↓
Error Interceptor (401 → refresh, 403 → redirect)
  ↓
Backend API (/api/...)
```

### Proje Yapısı

```
OsbErpLite-Frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/              ← AuthService, guards
│   │   │   ├── interceptors/      ← JWT, Error interceptors
│   │   │   ├── models/            ← DTO'lar, enum'lar, response modelleri
│   │   │   └── services/          ← ApiService, ThemeService
│   │   ├── shared/
│   │   │   └── components/        ← 14 reusable component
│   │   │       ├── badge/
│   │   │       ├── button/
│   │   │       ├── card/
│   │   │       ├── confirm-dialog/
│   │   │       ├── data-table/
│   │   │       ├── empty-state/
│   │   │       ├── filter-bar/
│   │   │       ├── input/
│   │   │       ├── modal/
│   │   │       ├── pagination/
│   │   │       ├── search-input/
│   │   │       ├── select/
│   │   │       ├── skeleton/
│   │   │       └── toast/
│   │   ├── features/              ← 14 lazy-loaded modül
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── business-partners/
│   │   │   ├── dashboard/
│   │   │   ├── departments/
│   │   │   ├── employees/
│   │   │   ├── leave-requests/
│   │   │   ├── not-found/
│   │   │   ├── positions/
│   │   │   ├── products/
│   │   │   ├── purchase-orders/
│   │   │   ├── sales-orders/
│   │   │   ├── stock-movements/
│   │   │   └── warehouses/
│   │   └── layout/
│   │       ├── layout.component.ts
│   │       ├── sidebar/
│   │       └── topbar/
│   ├── environments/
│   │   ├── environment.ts         ← Development (localhost:5000)
│   │   └── environment.prod.ts    ← Production (/api proxy)
│   └── styles/
├── Dockerfile                     ← Multi-stage: node build + nginx serve
├── nginx.conf                     ← SPA fallback + /api proxy + gzip
├── docker-compose.fullstack.yml   ← PostgreSQL + API + Migrate + Frontend
├── .env.example
└── .dockerignore
```

---

<a id="tr-tasarım"></a>

## 🎨 Tasarım Sistemi

### Renk Paleti

| Token | Light | Dark | Kullanım |
| --- | --- | --- | --- |
| `--color-primary` | `#7C5CFC` | `#7C5CFC` | Ana aksiyon, aktif state |
| `--color-bg-primary` | `#FFFFFF` | `#0B1120` | Sayfa arka planı |
| `--color-bg-secondary` | `#F8FAFC` | `#111827` | Kart, panel arka planı |
| `--color-text-primary` | `#0F172A` | `#F1F5F9` | Ana metin |

### Tipografi

- **Display & Body:** Plus Jakarta Sans (headings, paragraflar)
- **Data & Sayılar:** JetBrains Mono (fiyatlar, stok miktarları, tablolar)

### Component Kütüphanesi (14 Bileşen)

| Component | Varyantlar |
| --- | --- |
| Button | primary, secondary, destructive, ghost, outline + sm/md/lg |
| Card | Double-Bezel + standard |
| Input | text, email, password, number + label + error + helper |
| Select | options, placeholder, label + error |
| Modal | open/close, backdrop, ESC, animasyon |
| Badge | status renk kodları (success, warning, error, info) |
| Toast | success, error, info, warning + auto-dismiss |
| Pagination | sayfa numaraları, önceki/sonraki |
| DataTable | columns config, sort, row hover, empty state, skeleton |
| FilterBar | search + dropdown filters + active badges + clear |
| ConfirmDialog | başlık, mesaj, onayla/iptal |
| EmptyState | ikon, mesaj, CTA buton |
| Skeleton | satır, kart, tablo shimmer varyantları |
| SearchInput | debounce 300ms, clear butonu |

### Dark / Light Mode

- Sistem tercihine göre otomatik başlangıç
- Manuel toggle (localStorage'da saklanır)
- Tüm sayfalar ve componentler uyumlu
- `prefers-reduced-motion` desteği

---

## 🔐 Güvenlik

### Frontend Tarafı

- JWT token `localStorage`'da saklanır
- Her HTTP isteğine JWT auto-attach (interceptor)
- 401 yanıtı → refresh token flow otomatik tetiklenir
- 403 yanıtı → yetkisiz erişim yönlendirmesi
- Route guard: auth + role bazlı koruma
- XSS koruması: Angular DomSanitizer

### Docker / Production

- Nginx ile SPA fallback + `/api` reverse proxy
- Static asset caching (1 yıl, immutable)
- `index.html` no-cache (her zaman güncel)
- Gzip sıkıştırma aktif

---

## 🐳 Docker — Fullstack Deployment

### Mimari

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│ PostgreSQL  │
│  nginx:80    │     │  .NET:8080  │     │    :5432    │
│  :4200       │     │  :5019      │     │  :5433      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    ▲
       │   /api proxy       │
       └────────────────────┘
```

### Container'lar

| Servis | Image | Port | Açıklama |
| --- | --- | --- | --- |
| `postgres` | postgres:16 | 5433 | Veritabanı |
| `migrate` | .NET SDK | - | EF Core migration (çalışır ve çıkar) |
| `api` | .NET 8 Runtime | 5019 | Backend API |
| `frontend` | node:22 + nginx | 4200 | Angular SPA |

### Çalıştırma

```bash
cp .env.example .env
# .env dosyasını düzenleyin
docker compose -f docker-compose.fullstack.yml up -d --build
```

Adresler:

```
Frontend: http://localhost:4200
API:      http://localhost:5019
Swagger:  http://localhost:5019/swagger
```

Durdurma:

```bash
docker compose -f docker-compose.fullstack.yml down
```

---

<a id="tr-kurulum"></a>

## 🚀 Kurulum

### Gereksinimler

- Node.js 22+
- Angular CLI
- Docker Desktop (fullstack için)
- [OsbErpLite Backend](https://github.com/Deniz-Kmr/OsbErpLite) (API)

### Repository'yi Klonlama

```bash
git clone https://github.com/Deniz-Kmr/OsbErpLite-Frontend.git
cd OsbErpLite-Frontend
npm install
```

### Local Geliştirme (Backend Ayrı)

Backend'in `localhost:5000`'de çalıştığından emin olun:

```bash
ng serve
```

Adres: `http://localhost:4200`

### Fullstack (Docker Compose)

Backend ve frontend'i birlikte ayağa kaldırır:

```bash
cp .env.example .env
docker compose -f docker-compose.fullstack.yml up -d --build
```

### Production Build

```bash
ng build --configuration=production
```

Çıktı: `dist/osberplite-frontend/browser/`

---

## 💡 Neden Bu Teknoloji Seçimleri?

### Standalone Components (NgModule Yok)

Angular'ın modern yaklaşımını benimsedim. NgModule boilerplate'i yerine her component kendi bağımlılıklarını doğrudan import eder. Bu sayede:
- Component'ler tamamen bağımsız ve taşınabilir
- Tree-shaking daha etkili çalışır
- Yeni feature eklemek = yeni bir standalone component + route tanımlamak

### RxJS BehaviorSubject (NgRx Yok)

Bu ölçekte NgRx overkill olurdu. Her feature servisi kendi state'ini BehaviorSubject ile yönetiyor:
- Boilerplate minimal — action, reducer, effect, selector dosyaları yok
- Servis başına 50-80 satır, tamamı tek dosyada
- Component'ler `async` pipe ile subscribe oluyor, memory leak riski yok

### Tailwind CSS (Custom CSS Yok)

Utility-first yaklaşımı ile:
- Design token'ları CSS variable olarak tanımlı
- Dark/light mode `class` strategy ile
- Responsive breakpoint'ler standart ve tutarlı
- Component styling inline, ayrı CSS dosyası yok

### Shared Component Kütüphanesi

14 reusable component ile tüm CRUD modülleri aynı pattern'i takip ediyor. Yeni modül eklemek = mevcut component'leri compose etmek. Bu, 14 feature modülünü tutarlı bir UI ile sunmayı mümkün kıldı.

---

## 🌿 Git Akışı

```
main
develop
feature/*
fix/*
```

Kurallar:

- `main` branch'ine doğrudan push yapılmaz
- Günlük geliştirme `develop` üzerinden ilerler
- Her yeni iş için `feature/xxx` branch'i açılır, iş bitince `develop`'a merge edilir
- Commit formatı: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- Commit mesajları İngilizce yazılır

---

## 📌 Güncel Durum

Tamamlanan başlıklar:

- Angular 22 Standalone Components altyapısı
- TypeScript Strict Mode + path alias'ları
- Tailwind CSS design system token'ları
- Core katmanı: AuthService, JWT/Error interceptor, guards
- Layout shell: sidebar, topbar, dark/light mode toggle
- 14 shared UI component
- Auth sayfaları: login, register
- Dashboard: KPI kartları, bar chart, doughnut chart
- Business Partners: CRUD + filtreleme
- Products & Warehouses: CRUD + depo ataması
- Stock Movements: read-only liste + filtreleme
- Purchase Orders: CRUD + lifecycle (Draft → Approved → Completed)
- Sales Orders: CRUD + lifecycle
- Departments & Positions: CRUD
- Employees: CRUD + departman/pozisyon/yönetici ilişkisi
- Leave Requests: CRUD + onay akışı
- Admin: kullanıcı yönetimi, şifre sıfırlama, SAP sync
- 404 sayfası
- Responsive tasarım (375px — 1440px)
- Dark mode tutarlılığı (tüm sayfalar)
- Docker fullstack: PostgreSQL + .NET API + Angular (nginx)
- Nginx: SPA fallback + /api reverse proxy + gzip + cache

---

<h2 id="english">🇬🇧 English</h2>

<div align="center">

# OsbErpLite Frontend

### Modern Angular SPA for the Organized Industrial Zone ERP system

[Architecture](#en-architecture) •
[Modules](#en-modules) •
[Getting Started](#en-getting-started) •
[Design System](#en-design)

<br />

<img src="https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 22" />
<img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/RxJS-7-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS" />

<br />

<img src="https://img.shields.io/badge/Chart.js-4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
<img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />

<br />

<p>
  <img src="https://img.shields.io/badge/Components-Standalone-F59E0B?style=flat-square" alt="Standalone Components" />
  <img src="https://img.shields.io/badge/State-RxJS_BehaviorSubject-B7178C?style=flat-square" alt="RxJS State" />
  <img src="https://img.shields.io/badge/Auth-JWT-111827?style=flat-square" alt="JWT Auth" />
  <img src="https://img.shields.io/badge/Routing-Lazy_Loading-2563EB?style=flat-square" alt="Lazy Loading" />
  <img src="https://img.shields.io/badge/Theme-Dark_%2F_Light-6366F1?style=flat-square" alt="Dark/Light Theme" />
</p>

</div>

---

## 📖 About the Project

**OsbErpLite Frontend** is the modern SPA interface for the [OsbErpLite Backend](https://github.com/Deniz-Kmr/OsbErpLite) API. It provides stock, orders, business partners, HR, and dashboard modules in a single panel.

Built with **Angular 22**, **TypeScript Strict**, **Tailwind CSS**, and **RxJS** using a **Standalone Components** approach. No NgModule. State management uses service + RxJS BehaviorSubject pattern.

---

<a id="en-modules"></a>

## 🧭 Modules

### Dashboard

- KPI cards: Active Employees, Customers, Suppliers, Pending Orders, Low Stock, Pending Leaves, Pending Purchase, Pending Sales
- Count-up animated numbers
- Monthly stock movement bar chart (last 6 months)
- Department distribution doughnut chart
- Responsive grid: 4 → 2 → 1 columns

### Business Partners

- Customer, supplier, and dual-role partner list
- Filtering: search + type filter
- CRUD: create, edit, delete (role-based)
- Cascade protection toast messages

### Products & Warehouses

- Product CRUD: SKU, name, unit price, stock quantity, warehouse assignment
- Warehouse CRUD: name, location
- Stock movements: read-only list, date + type filter

### Order Management (Purchase & Sales)

- Purchase and sales orders
- Dynamic line item form
- Lifecycle buttons: Draft → Approved → Completed / Rejected
- Status badge color coding
- Detail page: order info + product lines

### Human Resources

- Department and position CRUD
- Employee CRUD: department/position select, manager hierarchy
- Leave requests: approval workflow (Pending → Approved / Rejected)
- Status badges

### Admin Panel

- User management: list, create, edit, delete
- Role assignment (Admin, Manager, Employee)
- Password reset
- SAP sync trigger

### Auth (Authentication)

- Login and Register pages
- JWT token management (access + refresh token rotation)
- Auto-attach interceptor
- 401 → refresh token retry
- Role-based route guard

---

## 🛠 Technology Stack

| Area | Technology | Version |
| --- | --- | --- |
| Framework | Angular (Standalone Components) | 22.x |
| Language | TypeScript (Strict Mode) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Reactive | RxJS | 7.x |
| Charts | Chart.js | 4.x |
| Font (Display) | Plus Jakarta Sans | - |
| Font (Data) | JetBrains Mono | - |
| Icons | Phosphor Icons (Light) | - |
| Container | Docker (multi-stage) + Nginx | - |
| Linter | Prettier | - |

---

<a id="en-architecture"></a>

## 🏗 Architecture

### Layer Structure

```
core/       → Singleton services, interceptors, guards, models (app-wide)
shared/     → Reusable UI components, pipes, directives (cross-module)
features/   → Lazy-loaded feature modules (each independent)
layout/     → Shell: sidebar, topbar, main content wrapper
```

### State Management

No NgRx or Redux. Each feature service uses:

```
Service (BehaviorSubject) → Component (async pipe) → Template
```

This approach is sufficient for this scale and avoids unnecessary boilerplate.

### Routing

All feature modules are lazy-loaded:

```typescript
{
  path: 'products',
  loadChildren: () =>
    import('./features/products/products.routes')
      .then(m => m.PRODUCT_ROUTES)
}
```

### Request Flow

```
Component
  ↓
Feature Service (HttpClient)
  ↓
JWT Interceptor (auto-attach token)
  ↓
Error Interceptor (401 → refresh, 403 → redirect)
  ↓
Backend API (/api/...)
```

### Project Structure

```
OsbErpLite-Frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/              ← AuthService, guards
│   │   │   ├── interceptors/      ← JWT, Error interceptors
│   │   │   ├── models/            ← DTOs, enums, response models
│   │   │   └── services/          ← ApiService, ThemeService
│   │   ├── shared/
│   │   │   └── components/        ← 14 reusable components
│   │   │       ├── badge/
│   │   │       ├── button/
│   │   │       ├── card/
│   │   │       ├── confirm-dialog/
│   │   │       ├── data-table/
│   │   │       ├── empty-state/
│   │   │       ├── filter-bar/
│   │   │       ├── input/
│   │   │       ├── modal/
│   │   │       ├── pagination/
│   │   │       ├── search-input/
│   │   │       ├── select/
│   │   │       ├── skeleton/
│   │   │       └── toast/
│   │   ├── features/              ← 14 lazy-loaded modules
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── business-partners/
│   │   │   ├── dashboard/
│   │   │   ├── departments/
│   │   │   ├── employees/
│   │   │   ├── leave-requests/
│   │   │   ├── not-found/
│   │   │   ├── positions/
│   │   │   ├── products/
│   │   │   ├── purchase-orders/
│   │   │   ├── sales-orders/
│   │   │   ├── stock-movements/
│   │   │   └── warehouses/
│   │   └── layout/
│   │       ├── layout.component.ts
│   │       ├── sidebar/
│   │       └── topbar/
│   ├── environments/
│   │   ├── environment.ts         ← Development (localhost:5000)
│   │   └── environment.prod.ts    ← Production (/api proxy)
│   └── styles/
├── Dockerfile                     ← Multi-stage: node build + nginx serve
├── nginx.conf                     ← SPA fallback + /api proxy + gzip
├── docker-compose.fullstack.yml   ← PostgreSQL + API + Migrate + Frontend
├── .env.example
└── .dockerignore
```

---

<a id="en-design"></a>

## 🎨 Design System

### Color Palette

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `--color-primary` | `#7C5CFC` | `#7C5CFC` | Primary action, active state |
| `--color-bg-primary` | `#FFFFFF` | `#0B1120` | Page background |
| `--color-bg-secondary` | `#F8FAFC` | `#111827` | Card, panel background |
| `--color-text-primary` | `#0F172A` | `#F1F5F9` | Main text |

### Typography

- **Display & Body:** Plus Jakarta Sans (headings, paragraphs)
- **Data & Numbers:** JetBrains Mono (prices, stock quantities, tables)

### Component Library (14 Components)

| Component | Variants |
| --- | --- |
| Button | primary, secondary, destructive, ghost, outline + sm/md/lg |
| Card | Double-Bezel + standard |
| Input | text, email, password, number + label + error + helper |
| Select | options, placeholder, label + error |
| Modal | open/close, backdrop, ESC, animation |
| Badge | status color codes (success, warning, error, info) |
| Toast | success, error, info, warning + auto-dismiss |
| Pagination | page numbers, prev/next |
| DataTable | columns config, sort, row hover, empty state, skeleton |
| FilterBar | search + dropdown filters + active badges + clear |
| ConfirmDialog | title, message, confirm/cancel |
| EmptyState | icon, message, CTA button |
| Skeleton | row, card, table shimmer variants |
| SearchInput | debounce 300ms, clear button |

### Dark / Light Mode

- Auto-detects system preference
- Manual toggle (persisted in localStorage)
- All pages and components are compatible
- `prefers-reduced-motion` support

---

## 🔐 Security

### Frontend

- JWT token stored in `localStorage`
- JWT auto-attach on every HTTP request (interceptor)
- 401 response → automatic refresh token flow
- 403 response → unauthorized page redirect
- Route guards: auth + role-based protection
- XSS protection: Angular DomSanitizer

### Docker / Production

- Nginx SPA fallback + `/api` reverse proxy
- Static asset caching (1 year, immutable)
- `index.html` no-cache (always fresh)
- Gzip compression enabled

---

## 🐳 Docker — Fullstack Deployment

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│ PostgreSQL  │
│  nginx:80    │     │  .NET:8080  │     │    :5432    │
│  :4200       │     │  :5019      │     │  :5433      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    ▲
       │   /api proxy       │
       └────────────────────┘
```

### Containers

| Service | Image | Port | Description |
| --- | --- | --- | --- |
| `postgres` | postgres:16 | 5433 | Database |
| `migrate` | .NET SDK | - | EF Core migration (runs and exits) |
| `api` | .NET 8 Runtime | 5019 | Backend API |
| `frontend` | node:22 + nginx | 4200 | Angular SPA |

### Running

```bash
cp .env.example .env
# Edit .env with your values
docker compose -f docker-compose.fullstack.yml up -d --build
```

Addresses:

```
Frontend: http://localhost:4200
API:      http://localhost:5019
Swagger:  http://localhost:5019/swagger
```

Stop:

```bash
docker compose -f docker-compose.fullstack.yml down
```

---

<a id="en-getting-started"></a>

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- Angular CLI
- Docker Desktop (for fullstack)
- [OsbErpLite Backend](https://github.com/Deniz-Kmr/OsbErpLite) (API)

### Clone the Repository

```bash
git clone https://github.com/Deniz-Kmr/OsbErpLite-Frontend.git
cd OsbErpLite-Frontend
npm install
```

### Local Development (Separate Backend)

Make sure the backend is running on `localhost:5000`:

```bash
ng serve
```

Address: `http://localhost:4200`

### Fullstack (Docker Compose)

Starts both backend and frontend together:

```bash
cp .env.example .env
docker compose -f docker-compose.fullstack.yml up -d --build
```

### Production Build

```bash
ng build --configuration=production
```

Output: `dist/osberplite-frontend/browser/`

---

## 💡 Why These Technology Choices?

### Standalone Components (No NgModule)

I adopted Angular's modern approach. Instead of NgModule boilerplate, each component directly imports its own dependencies:
- Components are fully independent and portable
- Tree-shaking works more effectively
- Adding a new feature = new standalone component + route definition

### RxJS BehaviorSubject (No NgRx)

NgRx would be overkill at this scale. Each feature service manages its own state with BehaviorSubject:
- Minimal boilerplate — no action, reducer, effect, selector files
- 50-80 lines per service, everything in a single file
- Components subscribe via `async` pipe, zero memory leak risk

### Tailwind CSS (No Custom CSS)

With the utility-first approach:
- Design tokens defined as CSS variables
- Dark/light mode via `class` strategy
- Responsive breakpoints are standard and consistent
- Component styling is inline, no separate CSS files

### Shared Component Library

14 reusable components ensure all CRUD modules follow the same pattern. Adding a new module = composing existing components. This made it possible to ship 14 feature modules with a consistent UI.

---

## 🌿 Git Workflow

```
main
develop
feature/*
fix/*
```

Rules:

- Do not push directly to `main`
- Daily development happens on `develop`
- Each task gets a `feature/xxx` branch, merged into `develop` when complete
- Commit format: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- Commit messages are written in English

---

## 📌 Current Status

Completed milestones:

- Angular 22 Standalone Components foundation
- TypeScript Strict Mode + path aliases
- Tailwind CSS design system tokens
- Core layer: AuthService, JWT/Error interceptors, guards
- Layout shell: sidebar, topbar, dark/light mode toggle
- 14 shared UI components
- Auth pages: login, register
- Dashboard: KPI cards, bar chart, doughnut chart
- Business Partners: CRUD + filtering
- Products & Warehouses: CRUD + warehouse assignment
- Stock Movements: read-only list + filtering
- Purchase Orders: CRUD + lifecycle (Draft → Approved → Completed)
- Sales Orders: CRUD + lifecycle
- Departments & Positions: CRUD
- Employees: CRUD + department/position/manager relations
- Leave Requests: CRUD + approval workflow
- Admin: user management, password reset, SAP sync
- 404 page
- Responsive design (375px — 1440px)
- Dark mode consistency (all pages)
- Docker fullstack: PostgreSQL + .NET API + Angular (nginx)
- Nginx: SPA fallback + /api reverse proxy + gzip + caching
