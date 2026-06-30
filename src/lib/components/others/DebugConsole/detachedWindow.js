/**
 * Opens a detached debug console in a separate browser window.
 * The window listens to the BroadcastChannel "smartcommon-logs" for log entries.
 * Fully standalone: no external dependencies, inline HTML/CSS/JS.
 */
export const openDetachedWindow = () => {
    const win = window.open("", "smartcommon-debug", "width=900,height=600,resizable=yes,scrollbars=yes");
    if (!win) {
        console.error("[DebugConsole] Popup blocked. Please allow popups for this site.");
        return null;
    }

    win.document.open();
    win.document.write(DETACHED_HTML);
    win.document.close();

    return win;
};

const DETACHED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Debug Console</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #111827; color: #e5e7eb; font-family: ui-monospace, "Cascadia Mono", "Segoe UI Mono", "Liberation Mono", Menlo, Monaco, Consolas, monospace; font-size: 12px; display: flex; flex-direction: column; height: 100vh; }
#toolbar { background: #1f2937; border-bottom: 1px solid #374151; padding: 6px 8px; display: flex; flex-direction: column; gap: 6px; }
#toolbar-row1 { display: flex; gap: 6px; align-items: center; }
#toolbar-row2 { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
#search { flex: 1; min-width: 0; padding: 4px 8px; background: #111827; border: 1px solid #374151; border-radius: 4px; color: #e5e7eb; font-size: 12px; outline: none; font-family: inherit; }
#search:focus { border-color: #3b82f6; }
.btn { padding: 4px 8px; font-size: 11px; background: #374151; color: #9ca3af; border: none; border-radius: 4px; cursor: pointer; font-family: inherit; }
.btn:hover { background: #4b5563; color: white; }
.level-btn { padding: 2px 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; border: none; border-radius: 4px; cursor: pointer; transition: opacity 0.15s; font-family: inherit; }
.level-btn.active { opacity: 1; }
.level-btn.inactive { opacity: 0.4; }
.level-debug { background: #4b5563; color: #d1d5db; }
.level-info { background: #1e3a5f; color: #93c5fd; }
.level-warn { background: #713f12; color: #fcd34d; }
.level-error { background: #7f1d1d; color: #fca5a5; }
#ns-container { position: relative; }
#ns-btn { padding: 2px 8px; font-size: 10px; background: #374151; color: #d1d5db; border: none; border-radius: 4px; cursor: pointer; font-family: inherit; }
#ns-btn:hover { background: #4b5563; }
#ns-dropdown { display: none; position: absolute; top: 100%; left: 0; margin-top: 4px; background: #1f2937; border: 1px solid #4b5563; border-radius: 4px; min-width: 160px; max-height: 200px; overflow-y: auto; z-index: 50; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
#ns-dropdown.open { display: block; }
#ns-dropdown label { display: flex; align-items: center; gap: 6px; padding: 4px 8px; cursor: pointer; font-size: 12px; }
#ns-dropdown label:hover { background: #374151; }
#ns-dropdown label.border-b { border-bottom: 1px solid #374151; }
#count { margin-left: auto; font-size: 10px; color: #6b7280; }
#logs { flex: 1; overflow-y: auto; overflow-x: hidden; }
.log-entry { display: flex; align-items: flex-start; gap: 6px; padding: 3px 8px; border-left: 2px solid transparent; }
.log-entry:hover { background: rgba(255,255,255,0.03); }
.log-entry.level-error-row { background: rgba(127,29,29,0.2); border-left-color: #ef4444; }
.log-entry.level-warn-row { background: rgba(113,63,18,0.15); border-left-color: #eab308; }
.timestamp { color: #6b7280; flex-shrink: 0; user-select: none; }
.badge { flex-shrink: 0; padding: 0 5px; border-radius: 999px; color: white; font-size: 10px; line-height: 16px; font-weight: bold; user-select: none; white-space: nowrap; }
.message { flex: 1; min-width: 0; color: #e5e7eb; word-break: break-all; }
.expand-indicator { color: #6b7280; margin-left: 4px; cursor: pointer; user-select: none; }
.expanded-data { margin-top: 4px; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px; color: #d1d5db; font-size: 11px; white-space: pre-wrap; overflow-x: auto; }
#status { padding: 4px 8px; background: #1f2937; border-top: 1px solid #374151; font-size: 10px; color: #6b7280; display: flex; align-items: center; gap: 8px; }
#status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
</style>
</head>
<body>
<div id="toolbar">
    <div id="toolbar-row1">
        <input type="text" id="search" placeholder="Filter...">
        <button class="btn" id="clear-btn">Clear</button>
    </div>
    <div id="toolbar-row2">
        <button class="level-btn level-debug active" data-level="debug">debug</button>
        <button class="level-btn level-info active" data-level="info">info</button>
        <button class="level-btn level-warn active" data-level="warn">warn</button>
        <button class="level-btn level-error active" data-level="error">error</button>
        <div id="ns-container">
            <button id="ns-btn">Namespaces ▾</button>
            <div id="ns-dropdown"></div>
        </div>
        <span id="count"></span>
    </div>
</div>
<div id="logs"></div>
<div id="status"><span id="status-dot"></span> Listening for logs...</div>
<script>
(function() {
    var logs = [];
    var maxLogs = 1000;
    var enabledLevels = { debug: true, info: true, warn: true, error: true };
    var allNamespacesEnabled = true;
    var enabledNamespaces = {};
    var knownNamespaces = {};
    var searchText = "";

    var logsEl = document.getElementById("logs");
    var searchEl = document.getElementById("search");
    var countEl = document.getElementById("count");
    var nsDropdown = document.getElementById("ns-dropdown");
    var nsBtn = document.getElementById("ns-btn");

    function formatTime(ts) {
        var d = new Date(ts);
        return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });
    }

    function formatMsg(m) {
        if (m === null) return "null";
        if (m === undefined) return "undefined";
        if (typeof m === "string") return m;
        if (m && m.__type === "Error") return m.message || m.stack || String(m);
        if (typeof m === "object") { try { return JSON.stringify(m, null, 2); } catch(e) { return String(m); } }
        return String(m);
    }

    function inlineMsg(m) {
        if (typeof m === "string") return m;
        if (m && m.__type === "Error") return m.message || String(m);
        if (typeof m === "object" && m !== null) { try { var s = JSON.stringify(m); return s.length > 100 ? s.slice(0,100) + "..." : s; } catch(e) { return String(m); } }
        return String(m);
    }

    function matchesFilter(entry) {
        if (!enabledLevels[entry.level]) return false;
        if (!allNamespacesEnabled && entry.namespace && !enabledNamespaces[entry.namespace]) return false;
        if (searchText) {
            var q = searchText.toLowerCase();
            var found = false;
            if (entry.label && entry.label.toLowerCase().indexOf(q) !== -1) found = true;
            if (!found && entry.namespace && entry.namespace.toLowerCase().indexOf(q) !== -1) found = true;
            if (!found) {
                for (var i = 0; i < entry.messages.length; i++) {
                    var s = typeof entry.messages[i] === "string" ? entry.messages[i] : formatMsg(entry.messages[i]);
                    if (s.toLowerCase().indexOf(q) !== -1) { found = true; break; }
                }
            }
            if (!found) return false;
        }
        return true;
    }

    function renderLogs() {
        var filtered = logs.filter(matchesFilter);
        var html = "";
        for (var i = 0; i < filtered.length; i++) {
            var e = filtered[i];
            var rowClass = "log-entry";
            if (e.level === "error") rowClass += " level-error-row";
            if (e.level === "warn") rowClass += " level-warn-row";
            var line = '<div class="' + rowClass + '">';
            line += '<span class="timestamp">' + formatTime(e.timestamp) + '</span>';
            if (e.namespace) line += '<span class="badge" style="background-color:' + safeColor(e.namespaceColor, "#607d8b") + '">' + escapeHtml(e.namespace) + '</span>';
            if (e.label) line += '<span class="badge" style="background-color:' + safeColor(e.labelColor, "grey") + '">' + escapeHtml(e.label) + '</span>';
            var text = e.messages.map(inlineMsg).join(" ");
            line += '<span class="message">' + escapeHtml(text) + '</span>';
            line += '</div>';
            html += line;
        }
        logsEl.innerHTML = html;
        countEl.textContent = filtered.length + (filtered.length !== logs.length ? "/" + logs.length : "");
        logsEl.scrollTop = logsEl.scrollHeight;
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    // Reject any color string that could break out of the style="" attribute or
    // inject extra CSS (quotes, angle brackets, semicolons, url()/expression()).
    // A normal color token (hex, name, rgb()) contains none of these. Kept as a
    // denylist of literal characters on purpose: a regex with backslash classes
    // would be mangled by this template literal's own escaping.
    function safeColor(c, fallback) {
        if (typeof c !== "string") return fallback;
        if (/["'<>;]/.test(c) || c.indexOf("url(") !== -1 || c.indexOf("expression") !== -1) {
            return fallback;
        }
        return c;
    }

    function updateNsDropdown() {
        var nsList = Object.keys(knownNamespaces).sort();
        if (nsList.length === 0) {
            nsBtn.style.display = "none";
            return;
        }
        nsBtn.style.display = "";
        var html = '<label class="border-b"><input type="checkbox" id="ns-all" ' + (allNamespacesEnabled ? "checked" : "") + '> <strong>All</strong></label>';
        for (var i = 0; i < nsList.length; i++) {
            var ns = nsList[i];
            var checked = allNamespacesEnabled || enabledNamespaces[ns];
            html += '<label><input type="checkbox" data-ns="' + ns + '" ' + (checked ? "checked" : "") + (allNamespacesEnabled ? " disabled" : "") + '> ' + ns + '</label>';
        }
        nsDropdown.innerHTML = html;
    }

    // BroadcastChannel listener
    var channel;
    try { channel = new BroadcastChannel("smartcommon-logs"); } catch(e) {}
    if (channel) {
        channel.onmessage = function(ev) {
            var entry = ev.data;
            logs.push(entry);
            if (logs.length > maxLogs) logs = logs.slice(-maxLogs);
            if (entry.namespace && !knownNamespaces[entry.namespace]) {
                knownNamespaces[entry.namespace] = true;
                updateNsDropdown();
            }
            renderLogs();
        };
    }

    // Event handlers
    searchEl.addEventListener("input", function() { searchText = searchEl.value; renderLogs(); });

    document.getElementById("clear-btn").addEventListener("click", function() { logs = []; renderLogs(); });

    document.querySelectorAll(".level-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            var lvl = btn.getAttribute("data-level");
            enabledLevels[lvl] = !enabledLevels[lvl];
            btn.classList.toggle("active", enabledLevels[lvl]);
            btn.classList.toggle("inactive", !enabledLevels[lvl]);
            renderLogs();
        });
    });

    nsBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        nsDropdown.classList.toggle("open");
    });

    nsDropdown.addEventListener("change", function(e) {
        var target = e.target;
        if (target.id === "ns-all") {
            allNamespacesEnabled = target.checked;
            enabledNamespaces = {};
            updateNsDropdown();
        } else if (target.dataset.ns) {
            allNamespacesEnabled = false;
            enabledNamespaces[target.dataset.ns] = target.checked;
            if (!target.checked) delete enabledNamespaces[target.dataset.ns];
            document.getElementById("ns-all").checked = false;
        }
        renderLogs();
    });

    document.addEventListener("click", function(e) {
        if (!document.getElementById("ns-container").contains(e.target)) {
            nsDropdown.classList.remove("open");
        }
    });

    renderLogs();
})();
</script>
</body>
</html>`;
