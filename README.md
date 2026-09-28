# IVI System — Interactive Simulation

Module 6 · In-Vehicle Infotainment (IVI) System
Project 1: Conceptual Architecture + Browser-Based Simulation

## 1. Project Overview

This project is a browser-based simulation of a conceptual **In-Vehicle
Infotainment (IVI) system**. It shows how a car's touchscreen, media
player, navigation system, projection system, and vehicle network work
together and exchange data.

The simulation is built with only **HTML, CSS, and vanilla JavaScript**
(plus inline SVG for the diagram). It needs no internet connection, no
installation, and no external libraries — it runs by simply opening
`index.html` in a browser.

## 2. Objective

The original task (Project 1) asks for a conceptual architecture diagram
of an IVI system that integrates media, navigation, and projection
features, with annotated component interfaces and data flow. This
simulation goes one step further: instead of a static diagram, it lets
you **click buttons and watch the data actually "flow"** through the
architecture, with a live event log and system status panel, so the
same diagram can be demonstrated interactively to faculty.

## 3. Architecture

The system is organized into three zones:

- **External devices** — things outside the car's own system: the
  **Driver** (touch/voice/button input) and a **Smartphone**
  (Android Auto / Apple CarPlay).
- **IVI System** — the car's infotainment stack:
  - **IVI HMI / Touch Display** — what the driver sees and touches.
  - **IVI Controller / Middleware** — receives every command and
    routes it to the correct service.
  - **Media Service** — manages audio playback and streaming.
  - **Navigation Service** — manages maps, routing, and location.
  - **Projection Service** — prepares content for the screen/HUD.
  - **Audio HAL** — hardware abstraction layer that turns media data
    into physical audio output.
  - **GPS Module** — supplies live GPS coordinates to Navigation.
  - **Display HAL** — hardware abstraction layer that turns projection
    data into physical video output.
  - **Map Database** — stored map data used for routing.
  - **Vehicle Speakers** — final audio output.
  - **Central Display / HUD** — final video output.
- **Vehicle System** — the rest of the car: the **Vehicle Network
  (CAN/LIN)** and the **Vehicle ECUs** (speed, ignition, gear, etc.),
  which the IVI Controller talks to for vehicle-state data.

Data flows downward from the driver's command, through the controller,
into the relevant service, then through a hardware abstraction layer,
and finally out to a physical output (speakers or display).

## 4. Project Structure

```
IVI_Simulation/
├── index.html   → Page structure: layout, panels, and the SVG diagram
├── style.css    → Visual theme, layout grid, and animation styles
├── script.js    → Simulation logic: state machine, scenarios, event log
└── README.md    → This file
```

- **index.html** — Contains the whole architecture diagram drawn as an
  SVG (boxes = components, lines = interfaces), plus the status panel,
  controls, event log, explanation, and project-info sections.
- **style.css** — A dark, engineering-dashboard style theme. Defines
  colors for each component category (media = green, navigation =
  blue, projection = purple, vehicle = grey), and the highlight/
  animation states (active, done, paused).
- **script.js** — Contains no HTML; it only reads/writes the page.
  It defines each of the five demo scenarios as a short list of steps
  (which node lights up, which arrow animates, what gets logged), and
  a small state machine that tracks whether music is playing, whether
  navigation/projection are active, and whether a call is in progress.
- **README.md** — Explanation and instructions (this file).

## 5. Requirements

- A modern browser: **Google Chrome** (recommended), Microsoft Edge,
  or Firefox.
- **No internet connection required.**
- **No installation required.**

## 6. How to Run

1. Extract/copy the `IVI_Simulation` folder anywhere on your computer.
2. Open the folder.
3. Double-click **index.html**.
4. The simulation opens directly in your browser.
5. Click the buttons on the right ("Simulation Controls") to run each
   demo scenario.

**Alternative:** Right-click `index.html` → **Open with** → **Google
Chrome**.

You do not need a local server — the file works fine when opened
directly (`file://...`).

## 7. How to Demonstrate to Faculty

A simple script you can follow during your demo:

1. **Open the simulator.** Point out the three zones in the diagram:
   external devices (top), the IVI system (large dashed box), and the
   vehicle system (right-hand dashed box).
2. **Explain the top-level flow:** Driver → IVI HMI → IVI Controller.
   Mention that the Controller is the "traffic router" of the whole
   system.
3. **Click PLAY MUSIC.** Explain the highlighted path as it lights up
   step by step: Driver → HMI → Controller → Media Service → Audio
   HAL → Vehicle Speakers. Point out the live entries appearing in the
   Event Log and the "MUSIC PLAYING" status.
4. **Click START NAVIGATION.** Explain how the Navigation Service
   combines live GPS data with stored Map Database data to plan a
   route.
5. **Click PROJECT ROUTE.** (This requires Navigation to already be
   active — clicking it first, without a route, shows a rejection
   message instead of running, which is intentional: there is nothing
   to project yet.) Explain how the Projection Service takes route
   data and sends it through the Display HAL to the Central Display /
   HUD.
6. **Click INCOMING CALL** (while music is playing). Explain that the
   Smartphone signals the HMI, the Controller notifies Media Service,
   and playback is paused — a real example of two features (calls and
   media) interacting inside one architecture.
7. **Click END CALL.** Explain how the Controller tells Media Service
   to resume, restoring the previous playback state.
8. **Click RESET SIMULATION** to return everything to the IDLE state
   and demonstrate any scenario again.

## 8. Simulation Scenarios

| Button | What it demonstrates |
|---|---|
| **PLAY MUSIC** | Media Service → Audio HAL → Vehicle Speakers pipeline |
| **START NAVIGATION** | Navigation Service combining GPS + Map Database data |
| **PROJECT ROUTE** | Navigation → Projection Service → Display HAL → HUD (requires an active route — run START NAVIGATION first) |
| **INCOMING CALL** | Cross-feature interruption: a call pausing active media |
| **END CALL** | Recovery: call ending and media playback resuming |
| **RESET SIMULATION** | Returns the whole system to its IDLE state |

Each scenario updates the **System Status** panel, highlights the
relevant boxes and arrows in the diagram, animates a small moving dot
along the active data path, and appends timestamped entries to the
**Simulation Event Log**.

## 9. Component Description

| Component | Purpose |
|---|---|
| Driver | Provides touch, voice, or button input to the system |
| IVI HMI / Touch Display | The user interface the driver interacts with |
| Smartphone (Android Auto / Apple CarPlay) | External device that can share media, maps, calls, and projection with the IVI system |
| IVI Controller / Middleware | Central router that receives commands and dispatches them to services |
| Media Service | Manages audio playback and streaming sources |
| Navigation Service | Manages maps, routing, and location-based services |
| Projection Service | Prepares route/media content for on-screen or HUD display |
| Audio HAL | Hardware abstraction layer that converts media data into physical audio |
| GPS Module | Supplies live location data to the Navigation Service |
| Display HAL | Hardware abstraction layer that converts projection data into physical video |
| Vehicle Speakers | Final audio output device |
| Map Database | Stores map data used for route calculation |
| Central Display / HUD | Final visual output device |
| Vehicle Network (CAN/LIN) | Communication bus between the IVI Controller and the vehicle's ECUs |
| Vehicle ECUs | Electronic control units providing vehicle data (speed, gear, etc.) |

## 10. Data Flow

Key interfaces shown in the diagram:

- Driver → IVI HMI: *Touch / Voice / Button Commands*
- IVI HMI ↔ IVI Controller: *User Commands* / *UI Response / Status*
- Smartphone ↔ IVI HMI: *Projection / Media Data*
- IVI Controller → Media Service: *Media Control Commands*
- IVI Controller → Navigation Service: *Navigation Request*
- IVI Controller → Projection Service: *Projection Request*
- Navigation Service → Projection Service: *Route / Map Data*
- Media Service → Audio HAL: *Audio Data (PCM)*
- Audio HAL → Vehicle Speakers: *Audio Output*
- GPS Module → Navigation Service: *GPS Data*
- Map Database → Navigation Service: *Map Data*

  (GPS Module and Map Database are two independent sources that both
  feed the Navigation Service — the Map Database does **not** receive
  GPS data, and GPS data does **not** pass through the Map Database.)
- Projection Service → Display HAL: *Display Content*
- Display HAL → Central Display / HUD: *Video Output*
- IVI Controller ↔ Vehicle Network: *Vehicle Data (CAN)*
- Vehicle Network ↔ Vehicle ECUs: *CAN/LIN Messages*

## 11. Limitations

This is a **conceptual, educational simulation only**. It does **not**
implement a production Android Automotive or vehicle infotainment
stack. Specifically:

- No real vehicle CAN bus — the Vehicle Network is shown for
  architectural completeness only.
- No real GPS hardware — GPS data is simulated.
- No actual Android Automotive OS.
- No real Audio HAL or Display HAL — these are represented
  conceptually.
- No real ECU communication.
- No actual smartphone connection — Android Auto / CarPlay is
  represented as a labeled external device only.
- All data, timestamps, and events shown in the log are simulated for
  demonstration purposes.

## 12. Future Scope

Possible extensions for a more advanced version of this project:

- Integration with real Android Automotive OS components.
- A real CAN bus interface (e.g., via an OBD-II adapter).
- A Raspberry Pi hardware prototype with a physical touchscreen.
- A real GPS module feeding live coordinates.
- Voice-control input alongside touch.
- Actual Android Auto / Apple CarPlay integration.
- Real vehicle sensor data instead of simulated ECU values.
- Hardware-in-the-loop (HIL) testing with real vehicle components.
