# IVI System Documentation & Artifact Index

This directory serves as the technical documentation repository and asset catalog for the **In-Vehicle Infotainment (IVI) System Conceptual Architecture and Simulation** project (Module 6, Project 1)[cite: 3, 7].

---

## 🌐 Live Interactive Deployment

The fully functional, browser-native behavioral simulation is hosted via GitHub Pages and can be accessed without installation:

* **Live Interactive Simulator:** [https://annwesha2024.github.io/ivi-simulation-system/](https://annwesha2024.github.io/ivi-simulation-system/)
* **Project Source Repository:** [https://github.com/Annwesha2024/ivi-simulation-system](https://github.com/Annwesha2024/ivi-simulation-system)

The simulator is built with native web standards (HTML5, modern CSS3, vanilla ES6+ JavaScript, and responsive SVG vectors), requiring zero external dependencies, build pipelines, or active network connections[cite: 3, 5, 7].

---

## 📂 Directory Manifest & Asset Breakdown

| File | Format | Description & Scope |
|---|:---:|---|
| **`IVI_Project_Report_Annwesha_Das.pdf`** | PDF | **Primary Academic Report:** Complete submission document containing abstract, literature review (CAN/LIN, HAL, Android Automotive, AUTOSAR/COVESA), system methodology, 15-component architecture taxonomy, interface specifications, an 11-case test verification matrix, discussion, and academic references[cite: 7]. |
| **`ivi-architecture.pdf`** | Vector PDF | **Formal Architecture Blueprint:** High-fidelity architectural schematic detailing domain boundaries (External Devices, IVI System Boundary, Vehicle System Boundary), annotated component interconnects, and control vs. data flow conventions[cite: 6, 7]. |
| **`architecture1.png`** | Raster Image | High-resolution export of the baseline conceptual architecture, highlighting subsystem separation, color-coded functional domains (Media, Navigation, Projection, Vehicle), and primary command channels[cite: 6, 7]. |
| **`architecture 2.png`** | Raster Image | Supplementary structural diagram illustrating detailed data plane pathways, Hardware Abstraction Layer (HAL) handoffs, and CAN-bus integration points[cite: 6, 7]. |

---

## 🏛️ Architectural Context & Domain Overview

The documents in this folder describe a 15-component layered IVI system organized into three core operational zones[cite: 3, 7]:

### 1. External Domain
* **Driver:** Primary operator generating physical touch, capacitive gesture, or voice command inputs[cite: 3, 6, 7].
* **Smartphone:** External mobile platform interfacing via projection standards (Android Auto / Apple CarPlay) to stream media, handle cellular calls, and offload display content[cite: 3, 7].

### 2. IVI System Core (Host Platform)
* **IVI HMI:** Centralized touch-screen UI layer presenting visual status and capturing driver interactions[cite: 3, 7].
* **IVI Controller / Middleware:** Central inter-process communication (IPC) hub and service dispatcher responsible for routing commands, managing priority interrupts, and polling vehicle telemetry[cite: 6, 7].
* **Application Services:**
  * `Media Service`: Manages audio playback, track sequencing, and streaming source control[cite: 3, 7].
  * `Navigation Service`: Consumes independent inputs from the **GPS Module** (GNSS positioning) and **Map Database** (spatial vector tiles) to compile turn-by-turn routing vectors[cite: 3, 7].
  * `Projection Service`: Ingests route and phone data to assemble display framebuffers for output rendering[cite: 3, 7].
* **Hardware Abstraction Layers (HAL):**
  * `Audio HAL`: Converts high-level application audio into uncompressed PCM data streams[cite: 3, 6, 7].
  * `Display HAL`: Abstracts hardware-specific video driver interfaces for screen compositing[cite: 3, 7].
* **Physical System Outputs:**
  * `Vehicle Speakers`: Transducer hardware outputting amplified analog audio[cite: 3, 7].
  * `Central Display / HUD`: Physical in-cabin monitors presenting primary UI and projected navigation heads-up graphics[cite: 3, 7].

### 3. Vehicle Domain
* **Vehicle Network (CAN/LIN):** Automotive multiplexed serial bus providing bidirectional telemetry exchange[cite: 3, 7].
* **Vehicle ECUs:** Powertrain, braking, and body control units transmitting operational telemetry (vehicle speed, gear position, ignition status) to the IVI middleware[cite: 3, 7].

---

## 🔄 Interface Data Flow Mapping

Every interface highlighted in `ivi-architecture.pdf` and demonstrated in the live web simulator adheres to the following bus definitions[cite: 6, 7]: