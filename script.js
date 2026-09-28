/* =========================================================
   IVI System Simulation — script.js
   Vanilla JS, no dependencies. Runs entirely in the browser.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- element handles ---------- */
  const svg = document.getElementById("diagram");
  const flowDot = document.getElementById("flow-dot");
  const logBox = document.getElementById("log-box");
  const banner = document.getElementById("scenario-banner");

  const buttons = {
    playMusic: document.getElementById("btn-play-music"),
    startNav: document.getElementById("btn-start-nav"),
    projectRoute: document.getElementById("btn-project-route"),
    incomingCall: document.getElementById("btn-incoming-call"),
    endCall: document.getElementById("btn-end-call"),
    reset: document.getElementById("btn-reset"),
  };
  const allButtons = Object.values(buttons);

  const status = {
    mode: document.getElementById("st-mode"),
    media: document.getElementById("st-media"),
    nav: document.getElementById("st-nav"),
    proj: document.getElementById("st-proj"),
    call: document.getElementById("st-call"),
  };

  /* ---------- simulated clock ---------- */
  let simTime = 11 * 3600 + 31 * 60; // 11:31:00
  function tickClock(sec) {
    simTime += sec;
    const h = Math.floor(simTime / 3600) % 24;
    const m = Math.floor(simTime / 60) % 60;
    const s = simTime % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  /* ---------- application state ---------- */
  const state = {
    mode: "IDLE",
    musicPlaying: false,
    musicPausedByCall: false,
    navActive: false,
    projActive: false,
    callActive: false,
    busy: false, // an animation is currently running
  };

  /* ---------- logging ---------- */
  function clearLog() {
    logBox.innerHTML =
      '<div class="log-line log-line-muted">[--:--:--] Waiting for first action…</div>';
  }
  function log(message, opts = {}) {
    const first = logBox.querySelector(".log-line-muted");
    if (first) first.remove();
    const ts = tickClock(opts.gapSec ?? 1);
    const line = document.createElement("div");
    line.className = "log-line" + (opts.statusLine ? " status-line" : "");
    line.innerHTML = `<span class="ts">[${ts}]</span>${message}`;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function setBanner(text, cls) {
    banner.textContent = text;
    banner.className = "banner" + (cls ? " " + cls : "");
  }

  function setStatus(field, value, cls) {
    const el = status[field];
    if (!el) return;
    el.textContent = value;
    el.className = cls || "";
  }

  /* ---------- node / edge helpers ---------- */
  function nodeEl(id) {
    return document.getElementById("n-" + id);
  }
  function edgeEl(id) {
    return document.getElementById(id);
  }
  function clearNodeState(id) {
    const el = nodeEl(id);
    if (el) el.classList.remove("active", "done", "paused");
  }
  function clearEdgeState(id) {
    const el = edgeEl(id);
    if (el) el.classList.remove("active", "done");
  }
  function markNode(id, cls) {
    const el = nodeEl(id);
    if (!el) return;
    el.classList.remove("active", "done", "paused");
    if (cls) el.classList.add(cls);
  }
  function markEdge(id, cls) {
    const el = edgeEl(id);
    if (!el) return;
    el.classList.remove("active", "done");
    if (cls) el.classList.add(cls);
  }

  /* ---------- moving data-flow dot along an edge path ---------- */
  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function animateDot(edgeId, durationMs) {
    return new Promise((resolve) => {
      const path = edgeEl(edgeId);
      if (!path || typeof path.getPointAtLength !== "function") {
        resolve();
        return;
      }
      const len = path.getTotalLength();
      const start = performance.now();
      flowDot.classList.add("on");

      function step(now) {
        const t = Math.min(1, (now - start) / durationMs);
        const pt = path.getPointAtLength(t * len);
        flowDot.setAttribute("cx", pt.x);
        flowDot.setAttribute("cy", pt.y);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          flowDot.classList.remove("on");
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- generic chain player ----------
     chain: [{node, edgeFromPrev, msg}]
     the first item usually has no edgeFromPrev
  --------------------------------------------- */
  async function playChain(chain, { holdMs = 260, edgeMs = 420 } = {}) {
    for (let i = 0; i < chain.length; i++) {
      const step = chain[i];
      if (step.edgeFromPrev) {
        markEdge(step.edgeFromPrev, "active");
        await animateDot(step.edgeFromPrev, edgeMs);
        markEdge(step.edgeFromPrev, "done");
      }
      markNode(step.node, "active");
      if (step.msg) log(step.msg, { gapSec: 1 + Math.round(Math.random()) });
      await sleep(holdMs);
    }
  }

  function finalizeChain(nodeIds, cls) {
    nodeIds.forEach((id) => markNode(id, cls));
  }

  /* ---------- button lock while animating ---------- */
  function setBusy(isBusy) {
    state.busy = isBusy;
    allButtons.forEach((b) => (b.disabled = isBusy));
  }

  /* =========================================================
     SCENARIO 1 — PLAY MUSIC
     ========================================================= */
  async function scenarioPlayMusic() {
    if (state.busy) return;
    setBusy(true);
    setBanner("STATUS: STARTING MEDIA PLAYBACK…", "banner-media");
    setStatus("mode", "MEDIA (starting)", "busy");

    await playChain([
      { node: "driver", msg: "Driver interaction detected" },
      { node: "hmi", edgeFromPrev: "e-driver-hmi", msg: "HMI received media command" },
      { node: "controller", edgeFromPrev: "e-hmi-controller", msg: "Controller routed command to Media Service" },
      { node: "media", edgeFromPrev: "e-controller-media", msg: "Media Service generated audio stream" },
      { node: "audiohal", edgeFromPrev: "e-media-audiohal", msg: "Audio HAL processing PCM audio" },
      { node: "speakers", edgeFromPrev: "e-audiohal-speakers", msg: "Audio output sent to vehicle speakers" },
    ]);

    finalizeChain(["driver", "hmi", "controller"], "done");
    finalizeChain(["media", "audiohal", "speakers"], "done");

    state.musicPlaying = true;
    state.musicPausedByCall = false;
    state.mode = "MUSIC";
    setStatus("mode", "MUSIC");
    setStatus("media", "PLAYING", "ok");
    setBanner("STATUS: MUSIC PLAYING", "banner-media");
    log("MUSIC PLAYING", { statusLine: true });

    setBusy(false);
  }

  /* =========================================================
     SCENARIO 2 — START NAVIGATION
     ========================================================= */
  async function scenarioStartNav() {
    if (state.busy) return;
    setBusy(true);
    setBanner("STATUS: STARTING NAVIGATION…", "banner-nav");

    // Step 1: the driver's request travels down to Navigation Service.
    await playChain([
      { node: "driver", msg: "Driver requested navigation" },
      { node: "hmi", edgeFromPrev: "e-driver-hmi", msg: "HMI forwarded navigation request" },
      { node: "controller", edgeFromPrev: "e-hmi-controller", msg: "Controller activated Navigation Service" },
      { node: "nav", edgeFromPrev: "e-controller-nav", msg: "Navigation Service processing request" },
    ]);

    // Step 2: GPS Module supplies live location data INTO Navigation Service.
    markNode("gps", "active");
    log("GPS Module acquired location fix");
    await sleep(220);
    markEdge("e-gps-nav", "active");
    await animateDot("e-gps-nav", 420);
    markEdge("e-gps-nav", "done");
    markNode("nav", "active");
    log("GPS data received by Navigation Service");
    await sleep(200);

    // Step 3: Map Database supplies stored map data INTO Navigation Service.
    markNode("mapdb", "active");
    log("Map Database located relevant map tiles");
    await sleep(220);
    markEdge("e-mapdb-nav", "active");
    await animateDot("e-mapdb-nav", 420);
    markEdge("e-mapdb-nav", "done");
    markNode("nav", "active");
    log("Map data received by Navigation Service");
    await sleep(200);

    log("Route calculated");
    finalizeChain(["driver", "hmi", "controller"], "done");
    finalizeChain(["nav", "gps", "mapdb"], "done");

    state.navActive = true;
    state.mode = state.musicPlaying ? "MUSIC + NAVIGATION" : "NAVIGATION";
    setStatus("mode", state.mode);
    setStatus("nav", "ACTIVE", "ok");
    setBanner("STATUS: NAVIGATION ACTIVE", "banner-nav");
    log("Navigation status updated", { statusLine: true });

    setBusy(false);
  }

  /* =========================================================
     SCENARIO 3 — PROJECT ROUTE
     ========================================================= */
  async function scenarioProjectRoute() {
    if (state.busy) return;

    if (!state.navActive) {
      log("PROJECT ROUTE rejected — please start navigation first.");
      setBanner("STATUS: NO ROUTE AVAILABLE — START NAVIGATION FIRST", "banner-alert");
      return;
    }

    setBusy(true);
    setBanner("STATUS: PROJECTING ROUTE…", "banner-proj");

    await playChain([
      { node: "nav", msg: "Navigation route available" },
      { node: "proj", edgeFromPrev: "e-nav-proj", msg: "Projection Service received route data" },
      { node: "displayhal", edgeFromPrev: "e-proj-displayhal", msg: "Display content prepared" },
      { node: "hud", edgeFromPrev: "e-displayhal-hud", msg: "Route projected to Central Display / HUD" },
    ]);

    finalizeChain(["nav"], "done");
    finalizeChain(["proj", "displayhal", "hud"], "done");

    state.projActive = true;
    setStatus("proj", "ACTIVE", "ok");
    setBanner("STATUS: ROUTE PROJECTED", "banner-proj");
    log("ROUTE PROJECTED", { statusLine: true });

    setBusy(false);
  }

  /* =========================================================
     SCENARIO 4 — INCOMING CALL
     ========================================================= */
  async function scenarioIncomingCall() {
    if (state.busy) return;
    if (state.callActive) return;
    setBusy(true);
    setBanner("INCOMING CALL…", "banner-alert");
    setStatus("call", "INCOMING", "alert");

    const wasPlaying = state.musicPlaying;

    await playChain([
      { node: "phone", msg: "Incoming call detected" },
      { node: "hmi", edgeFromPrev: "e-hmi-phone", msg: "Smartphone connection received" },
      { node: "controller", edgeFromPrev: "e-hmi-controller", msg: "IVI Controller received call event" },
      {
        node: "media",
        edgeFromPrev: "e-controller-media",
        msg: wasPlaying
          ? "Media Service interrupted — playback paused"
          : "Media Service notified of call event",
      },
    ]);

    finalizeChain(["phone", "hmi", "controller"], "done");

    if (wasPlaying) {
      markNode("media", "paused");
      markNode("audiohal", "paused");
      markNode("speakers", "paused");
      markEdge("e-media-audiohal", null);
      markEdge("e-audiohal-speakers", null);
      state.musicPausedByCall = true;
      setStatus("media", "PAUSED", "busy");
      log("Current media playback paused");
    } else {
      markNode("media", "done");
    }

    log("Call interface activated");

    state.callActive = true;
    state.mode = "CALL";
    setStatus("mode", "CALL", "alert");
    setStatus("call", "ACTIVE", "alert");
    setBanner(
      wasPlaying ? "STATUS: CALL ACTIVE — MUSIC PAUSED" : "STATUS: CALL ACTIVE",
      "banner-alert"
    );
    log(wasPlaying ? "CALL ACTIVE — MUSIC PAUSED" : "CALL ACTIVE", { statusLine: true });

    setBusy(false);
  }

  /* =========================================================
     SCENARIO 5 — END CALL
     ========================================================= */
  async function scenarioEndCall() {
    if (state.busy) return;
    if (!state.callActive) {
      log("No active call to end");
      return;
    }
    setBusy(true);
    setBanner("STATUS: ENDING CALL…", "banner-alert");

    const resumeMusic = state.musicPausedByCall;

    log("Call ended");
    await sleep(250);
    markNode("phone", null);
    markEdge("e-hmi-phone", null);
    log("Call state cleared");

    markNode("controller", "active");
    await sleep(250);
    markNode("media", "active");
    markEdge("e-controller-media", "active");
    await animateDot("e-controller-media", 400);
    markEdge("e-controller-media", "done");
    log("Controller notified Media Service");

    if (resumeMusic) {
      await sleep(200);
      markEdge("e-media-audiohal", "active");
      await animateDot("e-media-audiohal", 350);
      markNode("audiohal", "active");
      markEdge("e-media-audiohal", "done");
      log("Previous media session restored");

      await sleep(150);
      markEdge("e-audiohal-speakers", "active");
      await animateDot("e-audiohal-speakers", 350);
      markNode("speakers", "active");
      markEdge("e-audiohal-speakers", "done");
      log("Music playback resumed");

      finalizeChain(["controller", "media", "audiohal", "speakers"], "done");
      state.musicPlaying = true;
      state.musicPausedByCall = false;
      setStatus("media", "PLAYING", "ok");
      setStatus("mode", state.navActive ? "MUSIC + NAVIGATION" : "MUSIC");
      setBanner("STATUS: MUSIC RESUMED", "banner-media");
      log("MUSIC RESUMED", { statusLine: true });
    } else {
      finalizeChain(["controller", "media"], "done");
      setStatus("media", "STOPPED");
      setStatus("mode", state.navActive ? "NAVIGATION" : "IDLE");
      setBanner("STATUS: CALL ENDED", "banner-nav");
      log("CALL ENDED", { statusLine: true });
    }

    state.callActive = false;
    setStatus("call", "NO CALL", "ok");

    setBusy(false);
  }

  /* =========================================================
     RESET
     ========================================================= */
  function scenarioReset() {
    setBusy(false);
    const ids = [
      "driver", "hmi", "phone", "controller", "vehiclenetwork", "ecus",
      "media", "nav", "proj", "audiohal", "gps", "displayhal",
      "speakers", "mapdb", "hud",
    ];
    ids.forEach(clearNodeState);
    document.querySelectorAll(".edge").forEach((e) => e.classList.remove("active", "done"));
    flowDot.classList.remove("on");

    state.mode = "IDLE";
    state.musicPlaying = false;
    state.musicPausedByCall = false;
    state.navActive = false;
    state.projActive = false;
    state.callActive = false;

    setStatus("mode", "IDLE");
    setStatus("media", "STOPPED");
    setStatus("nav", "INACTIVE");
    setStatus("proj", "INACTIVE");
    setStatus("call", "NO CALL");
    setBanner("STATUS: SYSTEM IDLE");
    log("Simulation reset");
  }

  /* ---------- wire up buttons ---------- */
  buttons.playMusic.addEventListener("click", scenarioPlayMusic);
  buttons.startNav.addEventListener("click", scenarioStartNav);
  buttons.projectRoute.addEventListener("click", scenarioProjectRoute);
  buttons.incomingCall.addEventListener("click", scenarioIncomingCall);
  buttons.endCall.addEventListener("click", scenarioEndCall);
  buttons.reset.addEventListener("click", scenarioReset);
  document.getElementById("btn-clear-log").addEventListener("click", clearLog);

  /* ---------- initial paint ---------- */
  setBanner("STATUS: SYSTEM IDLE");
})();
