# Sensor & Camera Mounts

Covers: machine-vision camera mounts, encoder mounts, LiDAR mounts, force-sensor flanges, and
general sensor-housing brackets.

See `README.md` for the source-type/confidence legend and the four-demand-layers framing.

## Market segments / buyer types

- Machine-vision integrators mounting industrial cameras on or near robot arms, needing
  mechanically stable, vibration-isolating brackets — Frigate's product line is explicitly named
  "Robotic Vision Camera Bracket" / "Robot Camera Mount for Machine Vision Systems"
  (`supplier_marketing`, `medium`, captured 2026-09-19, <https://frigate.ai/product/robotic-vision-camera-bracket/>).
- Robotics OEMs needing encoder, LiDAR, and force-sensor mounting hardware as part of a larger
  robot-arm or mobile-robot build, per RivCut's explicit product list ("encoder brackets, LiDAR
  mounts, camera brackets, and force sensor flanges") (`supplier_marketing`, `medium`,
  <https://www.rivcut.com/cnc-machining/houston/robotics/sensor-mounts/>).
- Hobbyist/prototyping-stage robotics builders buying commodity sensor/motor mount hardware
  off-the-shelf (RobotShop's "Sensor & Motor Mounts" collection) rather than custom parts — a
  distinct, lower-spec buyer segment worth noting because it represents the boundary below which
  a buyer doesn't need Manufacturing OS (`supplier_marketing`, `low`,
  <https://www.robotshop.com/collections/mounts>).
- Modular-automation integrators using standardized mounting-system components (Ruland's
  "Modular Mounting Systems for Robotics") as an alternative to fully custom brackets
  (`supplier_marketing`, `low`, <https://www.ruland.com/applications/robotic-systems/modular-mounting-systems-robotics.html>).

## Search queries + intent (qualitative — no real volume data)

| Query pattern | Likely intent | Reasoning |
|---|---|---|
| "robot camera mount" / "vision camera bracket robotics" | transactional | Near-exact match to Frigate's own product naming (`ai_inferred`, `low`). |
| "LiDAR mount custom" / "encoder bracket CNC" | transactional | Matches RivCut's named product list (`ai_inferred`, `low`). |
| "sensor mount tolerance" / "camera mount vibration" | informational | Matches the vibration-isolation and tolerance framing found across sources — a buyer researching why stability matters before speccing a part (`ai_inferred`, `low`). |
| "metal 3D printed sensor bracket" | commercial | Matches a dedicated 2026-dated integration-guide article, implying real comparison-shopping between additive and subtractive processes for this part type (`documentation_verified`, `medium`, captured 2026-09-19, <https://blog.met3dp.com/blog/metal-3d-printing-custom-sensor-brackets-in-2026-integration-guide/>). |
| "off the shelf sensor mount" vs "custom sensor mount" | commercial | Implied by the coexistence of commodity-mount sellers (RobotShop, Ruland) alongside custom-machining specialists — a real buyer decision point (`ai_inferred`, `low`). |

## Recurring engineering problems

- **Vibration isolation / focal stability.** Multiple sources frame the core engineering problem
  as providing "a mechanically stable platform that minimizes transmission of dynamic vibrations
  and transient shocks from robotic arm movements," with precision machining specifically called
  out as eliminating "micro-movements that disrupt focal stability during high-speed operation"
  (`supplier_marketing`, `medium`, <https://frigate.ai/product/robotic-vision-camera-bracket/>).
- **Structural rigidity vs. minimal mass**, optimized via FEA, using aerospace-grade aluminum or
  stainless — the same weight/stiffness tradeoff seen in the actuator-housing and structural-
  bracket clusters, suggesting this is a wedge-wide recurring theme rather than sensor-mount-
  specific (`supplier_marketing`, `medium`, same source).
- **Precision hole-pattern/tolerance requirements for optical alignment**: one source states
  camera-mounting tolerance around ±0.02 mm with custom hole patterns, and a separate source
  states ±0.0005" on critical features for encoder/LiDAR/camera brackets — both plausible for
  the same underlying need (optical/sensor axis alignment), though the two figures come from
  different sources and should not be treated as the same claim (`supplier_marketing`,
  `low`–`medium`, see limitation 3a in `README.md`).

## Common materials

- Aluminum 6061-T6 repeated across sources; also magnesium alloy and hardened Steel 4140
  mentioned for higher-rigidity or higher-load mount applications (`supplier_marketing`,
  `medium`).
- 304 stainless steel and Delrin also named for sensor/encoder mounting hardware specifically
  (`supplier_marketing`, `low`).

## Common processes

- CNC milling is the default. Metal 3D printing is presented as a viable 2026-era alternative
  specifically for sensor brackets, per the dedicated Met3DP integration guide — this is one of
  the few part types in the wedge where a 2026-dated third-party technical article discusses
  additive manufacturing as a real competing process rather than only machining
  (`documentation_verified`, `medium`, <https://blog.met3dp.com/blog/metal-3d-printing-custom-sensor-brackets-in-2026-integration-guide/>).

## Typical quantity patterns

No sensor-mount-specific quantity/volume data was found. By analogy with the wedge-wide
prototype-to-low-volume pattern (see `cnc-sheet-metal-general.md`), and given sensor mounts are
typically iterated alongside camera/sensor selection during prototyping, single-digit-to-low-
hundreds unit runs are the plausible default (`ai_inferred`, `low`).

## Competitor / alternative solution surfaces

- Frigate — dedicated robotic vision camera bracket product line (with a near-duplicate
  Israel-localized URL variant, suggesting active international/localized marketing).
- RivCut — sensor & encoder mounts page (Houston-localized variant found; likely other US-city
  variants exist following the same pattern seen in the gripper/actuator files).
- Zintilon — dedicated "Custom Sensor Housing Parts CNC Machining for the Robotics Industry" page.
- Met3DP — additive-manufacturing alternative specifically pitched at this part type.
- RobotShop, Ruland — commodity/off-the-shelf and modular-mounting-system alternatives to fully
  custom machined mounts; relevant as the "why would someone NOT need a custom part" boundary.
- CNCTAL — "CNC Machining Camera & Sensor Parts | Precision Optical Components Manufacturer"
  (<https://www.cnctal.com/camera-sensor-parts/>), another dedicated-page competitor.

## US vs Australia geography notes

- **US signal: moderate-to-strong.** RivCut's US-localized pages and the general concentration
  of US-based robotics-vision suppliers found.
- **Australia signal: none found at the part-type level.** No Australia-based sensor/camera-mount
  specialist was identified. **Flagged as a gap**, consistent with the pattern across the rest of
  the wedge.

## Sources referenced in this file

- <https://frigate.ai/product/robotic-vision-camera-bracket/>
- <https://frigate.ai/en-il/product/robotic-vision-camera-bracket/>
- <https://www.robotshop.com/collections/mounts>
- <https://www.ruland.com/applications/robotic-systems/modular-mounting-systems-robotics.html>
- <https://www.rivcut.com/cnc-machining/houston/robotics/sensor-mounts/>
- <https://www.zintilon.com/industry/robotics/sensor-housing/>
- <https://www.rivcut.com/blog/robotics-machining>
- <https://blog.met3dp.com/blog/metal-3d-printing-custom-sensor-brackets-in-2026-integration-guide/>
- <https://www.cnctal.com/camera-sensor-parts/>
