# Gatherr – Eelesitlus

---

## 1. Projekti idee (1 min)

**Gatherr** lahendab küsimuse: _"Millal me kõik vabad oleme?"_

Kasutaja loob ürituse, valib potentsiaalsed ajad, jagab linki – osalejad märgivad oma vaba aja interaktiivsel võrgustikul. Tulemus on kuumuskaart, kus kõige "heigedam" lahter näitab aega, mis sobib enamusele.

Inspireeritud tööriistadest nagu When2meet ja Doodle, aga mobiilisõbralikum ja kaasaegsema UX-iga.

---

## 2. Live demo (2 min)

**Voog:**
1. Ava [gatherr.alber.ee](https://gatherr.alber.ee)
2. Loo üritus – sisesta nimi, vali kuupäevad ja kellaajad
3. Jaga link teisele seadmele / brauseriaknale
4. Logi sisse Google'iga, märgi saadavus lohistamisega
5. Näita kuumuskaardi uuenemist grupikuvasel

---

## 3. Tehniline ülevaade (3 min)

### Arhitektuur

```
[Brauser] → [Cloudflare Pages – React SPA]
                        ↓ HTTPS
              [Traefik reverse proxy]
                        ↓
           [Spring Boot REST API – Docker]
                        ↓
              [PostgreSQL – Docker]
```

### Tehnoloogia stack

| Kiht | Tehnoloogia |
|---|---|
| Frontend | React, TanStack Router, TanStack Query, Tailwind CSS, TypeScript |
| Internatsionaliseerimine | Paraglide (ET / EN) |
| Backend | Spring Boot 3, Java 21 |
| Autentimine | Google OAuth2 (access_token flow) + app JWT |
| Andmebaas | PostgreSQL, Liquibase migratsioonid |
| API tüübid | OpenAPI → openapi-typescript → automaatne types.gen.ts |
| Deployment | Cloudflare Pages (FE), Docker + Traefik (BE) |

### Andmebaasiskeem

**users**
| väli | tüüp |
|---|---|
| id | BIGINT PK |
| name, email, profile_picture | VARCHAR |
| timezone | VARCHAR |
| start_on_monday, time_format_24 | BOOLEAN |
| language | VARCHAR |

**events**
| väli | tüüp |
|---|---|
| id | BIGINT PK |
| name, description, short_id | VARCHAR |
| creator_id | FK → users |
| type | ENUM (SPECIFIC_DATES_AND_TIMES, SPECIFIC_DATES, WEEKDAYS, WEEKDAYS_AND_TIMES) |
| times | JSONB (List\<String\>) |
| time_increment | INT |
| timezone | VARCHAR |
| is_deleted | BOOLEAN |

**event_user** (osaleja vastused)
| väli | tüüp |
|---|---|
| id | BIGINT PK |
| event_id | FK → events |
| user_id | FK → users |
| available | JSONB (List\<String\>) |
| not_available | JSONB (List\<String\>) |

Slot formaat: `"HHmm-ddMMyyyy"` (nt `"0900-27042026"`)

---

## 4. Kõige keerulisem funktsionaalsus (5 min)

### A. Kuumuskaart + ajavööndi teisendus

**Probleem:** Ürituse looja on Tallinnas (UTC+3), osaleja New Yorgis (UTC−4). Mõlemad peavad nägema oma kohaliku aja aegasid, aga andmebaasis peab olema üks ühine ajavöönd.

**Lahendus (kahes kihis):**

**Backend – normaliseerimine (`AvailabilityService.getSummary`):**
- Slotid salvestatakse alati ürituse ajavööndis (frontend saadab event-tz slotid)
- `normalizeSlot(slot, userZone, eventZone)` – kuna `event_user.timezone = null`, kasutatakse fallback'ina `eventZone` → no-op teisendus
- Kuumuskaart arvutatakse normaliseeritud slottide põhjal → kõik võrreldavad

```java
ZoneId userZone = eu.getTimezone() != null ? ZoneId.of(eu.getTimezone()) : eventZone;
// timezone=null → userZone=eventZone → normalizeSlot tagastab sama sloti
```

**Frontend – kuvamise teisendus (`HeatmapTabs.tsx` + `timezone.ts`):**
- `convertSlot(slot, eventTz, userTz)` teisendab kõik ürituse slotid kasutaja kohalikku aega
- `displayToSlot` map: kuvatav slot → originaalne event-tz slot
- `selectedSlots` jääb alati event-tz formaati (backend ühilduvus)
- Klõpsud tõlgitakse `displayToSlot` kaudu tagasi event-tz slottideks

```
Tallinn üritus 09:00 → New Yorgi kuvamine 02:00
Klõps 02:00 → displayToSlot → 09:00 → selectedSlots
```

### B. Interaktiivne lohistamine (`pointer events`)

Mobiilil ja lauaarvutil töötav lohistamine ilma `touch` sündmuste käsitsi haldamiseta:
- `onPointerDown` / `onPointerMove` / `onPointerUp` – üks käsitleja kõigile seadmetele
- `setPointerCapture` – hiirekursor võib liikuda väljaspool elementi
- `visitedSlots` ref – ei tohi sama slotti topelt lülitada ühe lohistuse jooksul
- Mobiilil eraldi "lohista" nupp, mis lülitab `touch-action: none` sisse (vaikimisi kerimine)

### C. OpenAPI → TypeScript tüübid (automaatne)

Husky pre-commit hook:
1. `curl` backend `/v3/api-docs` → `schema.json`
2. `openapi-typescript` genereerib `types.gen.ts`
3. `git add schema.json src/api/types.gen.ts`

Tulemus: frontend tüübid on alati sünkroonis backendiga, käsitsi tüüpe ei kirjutata.

---

## 5. Projektihaldus GitHubis (3 min)

### Töövoog

- **GitHub Projects** – Kanban tahvel sprindide haldamiseks
- **Issues** – iga funktsionaalsus / viga eraldi issue'na
- **Pull Requests** – kood läheb `main`-i ainult läbi PR + code review
- **Branch strateegia:** `feature/...`, `fix/...`, `BE-...` branchid

### Sprindid

| Sprint | Periood | Fookus |
|---|---|---|
| Sprint 1 | mar 09 – apr 04 | MVP: auth, event loomine, heatmap |
| Sprint 2 | apr 04 – mai 03 | Deployment, kasutaja seaded, tüübid, bugfixid |

### Tiimiliikmete panus

| Liige | Roll |
|---|---|
| **tomimarkus991** | FE & BE arhitektuur, issue ja projekti haldus, FE arendus, code review, DevOps (deployment) |
| **mkaaslv** | Backend arendus |
| **IngridLepik** | Backend arendus |
| **jsidla** | Backend arendus |
| **hannesverlis** | FE arendusega tutvumine (uus programmeerija) |
