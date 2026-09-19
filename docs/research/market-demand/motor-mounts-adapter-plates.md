# Motor Mounts & Adapter/Base Plates

Covers: motor mount plates, servo/gearbox mounting plates, robot base plates, EOAT/end-effector
adapter plates, "robot mount plates" matching specific bolt patterns.

See `README.md` for the source-type/confidence legend and the four-demand-layers framing.

## Market segments / buyer types

- Robot-cell integrators needing an adapter plate to physically join a specific robot arm's
  wrist flange to a specific tool/gripper — explicitly the framing used by Massive Dimension's
  "Robotic Mount Plate Adapter" ("extruder to robot") and Trimantec's "Robotic Adapter Plates"
  collection (`supplier_marketing`, `medium`, captured 2026-09-19,
  <https://massivedimension.com/products/robotic-mount-plate-adapter>,
  <https://trimantec.com/collections/adapter-plate>).
- Cobot integrators specifically, per EMI Corp's "Mounting Plates for Collaborative Robots" line
  (`supplier_marketing`, `medium`, <https://www.emicorp.com/eoat-components/framing/cobot-mounting-adapters>).
  This is a notable distinct sub-segment: cobots (collaborative robots) are a fast-growing robot
  category (see `cnc-sheet-metal-general.md` for the broader install-base context), and cobot
  integrators appear to be specifically served by dedicated adapter-plate product lines,
  suggesting the cobot boom is a real demand driver for this part type.
- Hobbyist/open-source robot-arm builders (Studica Robotics "Mounting Plates," community forum
  threads on RobotShop about base-plating a robot arm) — a lower-spec, DIY buyer segment distinct
  from the commercial-integrator segment above (`supplier_marketing`/`documentation_verified`,
  `low`, <https://www.studica.co/mounting-brackets-plates>,
  <https://community.robotshop.com/forum/t/base-plate-for-mounting-robot-arm/59035>).
- Motor/gearbox OEMs and machine builders needing precision motor-mount base plates "for
  accurate alignment and low vibration" as a discrete purchased component (`supplier_marketing`,
  `medium`, <https://ms-machining.com/base-plate-machining-services/>).

## Search queries + intent (qualitative — no real volume data)

| Query pattern | Likely intent | Reasoning |
|---|---|---|
| "robot adapter plate [robot brand]" (e.g. "UR adapter plate") | transactional | Matches the "customers specify their robot's make and model" framing found in adapter-plate marketing copy (`ai_inferred`, `low`). |
| "blank robot mounting plate" | transactional | Matches Trimantec's stated offering of blank plates for buyers to machine their own custom mount pattern — evidence of a semi-custom, lower-friction purchase path some buyers prefer over a fully bespoke part (`ai_inferred`, `low`). |
| "motor mount base plate custom" | transactional | Matches MS Machining's dedicated service-page title. |
| "cobot mounting adapter" | transactional/commercial | Matches EMI Corp's cobot-specific product line naming. |
| "how to mount robot arm to base plate" | informational | Matches the RobotShop community-forum thread pattern — a real, organic buyer/DIY question, not marketing copy (`documentation_verified`, `medium`). |

## Recurring engineering problems

- **Bolt-pattern/interface matching across heterogeneous robot and tool brands.** The dominant
  framing across sources is not a generic engineering challenge but an interoperability problem:
  every robot arm and every tool has its own flange bolt pattern, and the adapter plate's whole
  purpose is bridging two specific patterns (`ai_inferred`, `medium` — inferred from the
  repeated "specify your robot's make and model" pattern across multiple vendors, not a single
  authoritative source).
  (see also gripper/EOAT wrist-adapter-context, which overlaps here.)
- **Alignment and vibration control for motor mounting**, explicitly named as the purpose of
  precision motor-mount base plates (`supplier_marketing`, `low`, <https://ms-machining.com/base-plate-machining-services/>).
- **Process/payload tradeoff**: sources note machined, laser-cut, or 3D-printed options exist
  "depending on the payload and precision required," i.e. adapter/mount plates are one of the
  part types where the buyer's process choice is explicitly payload-driven rather than uniform
  across the category (`supplier_marketing`, `low`).

## Common materials

- Aluminum alloys (6061, 7075) dominate; carbon steel, stainless steel, and engineering plastics
  also named for motor-mount base plates specifically, likely reflecting a wider load/duty-cycle
  range than pure aluminum-only part families elsewhere in the wedge (`supplier_marketing`,
  `medium`).

## Common processes

- Machining (CNC milling) is the default for precision adapter/base plates; laser cutting and
  3D printing are named as lower-cost/faster alternatives depending on payload and precision
  needs (`supplier_marketing`, `low`).

## Typical quantity patterns

No adapter/motor-mount-plate-specific quantity data was found. The existence of "blank plate"
SKUs that buyers machine themselves (Trimantec) suggests at least part of this market is
extremely low-volume/one-off (a single integrator adapting one cell), consistent with the
wedge-wide prototype-to-low-volume pattern (`ai_inferred`, `low`).

## Competitor / alternative solution surfaces

- Trimantec — "Robotic Adapter Plates" collection.
- EMI Corp — cobot-specific mounting-adapter product line, part of a broader "EOAT components"
  catalog (overlaps with `gripper-jaws-eoat.md`).
- Massive Dimension — cross-category adapter (3D-printer extruder to robot arm), showing adapter
  plates also bridge robotics with adjacent tooling categories, not just robot-to-gripper.
- MS Machining — dedicated "Precision Base Plate CNC Machining Services" page.
- Studica Robotics, item (rbtx.com), RobotShop — commodity/off-the-shelf mounting-plate sellers,
  the lower-spec alternative to custom machining, same pattern as sensor mounts.
- General-purpose instant-quote marketplaces (see `cnc-sheet-metal-general.md`).

## US vs Australia geography notes

- **US signal: moderate.** Several named suppliers (Massive Dimension, Trimantec, EMI Corp, MS
  Machining) appear US-based based on site content found, though this research pass did not
  independently confirm headquarters location for each with a primary source.
- **Australia signal: none found at the part-type level.** No Australia-specific adapter-plate or
  motor-mount supplier or buyer evidence was found. **Flagged as a gap.**

## Sources referenced in this file

- <https://www.universal-robots.com/marketplace/products/01tP40000071NMwIAM/>
- <https://community.robotshop.com/forum/t/base-plate-for-mounting-robot-arm/59035>
- <https://robotroom.com/Back-And-Forth-7.html>
- <https://massivedimension.com/products/robotic-mount-plate-adapter>
- <https://www.studica.co/mounting-brackets-plates>
- <https://rbtx.com/en-US/components/profiles-more/item-robot-mounting-plate>
- <https://ms-machining.com/base-plate-machining-services/>
- <https://trimantec.com/collections/adapter-plate>
- <https://www.emicorp.com/eoat-components/framing/cobot-mounting-adapters>
