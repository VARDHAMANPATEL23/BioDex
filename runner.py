#!/usr/bin/env python3
"""
🌿 BioDex BTOP-Inspired Triple-Pane Terminal UI (TUI)
Splits terminal into 3 segments:
  - 1: Model Stats & Watcher
  - 2: Backend (FastAPI / Uvicorn)
  - 3: Frontend (Expo / Bun)
Dynamically adapts layout, sizes, and borders based on terminal window geometry (SIGWINCH).
"""

import curses
import fcntl
import os
import pty
import re
import select
import signal
import subprocess
import sys
import termios
from collections import deque
import time
import threading

ANSI_ESCAPE = re.compile(r'(?:\x1B\[[0-9;]*[mKA-Z]|\x1B\]8;;.*?\x1B\\|\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~]))')
import unicodedata
def display_width(text):
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in text)

def truncate_display(text, max_w):
    w = 0
    res = []
    for c in text:
        cw = 2 if unicodedata.east_asian_width(c) in "WF" else 1
        if w + cw > max_w: break
        w += cw
        res.append(c)
    return "".join(res)

def clean_ansi(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "").replace("\t", "    ")
    text = text.replace("\b", "") # remove backspaces
    return ANSI_ESCAPE.sub("", text)

class SubprocessPTY:
    def __init__(self, name: str, cmd: list, cwd: str, env=None):
        self.name = name
        self.cmd = cmd
        self.cwd = cwd
        self.env = env or os.environ.copy()
        self.lines = deque(maxlen=3000)
        self.partial_line = ""
        self.scroll_offset = 0
        self.master_fd = None
        self.slave_fd = None
        self.proc = None
        self.is_running = False

    def start(self):
        self.master_fd, self.slave_fd = pty.openpty()
        flags = fcntl.fcntl(self.master_fd, fcntl.F_GETFL)
        fcntl.fcntl(self.master_fd, fcntl.F_SETFL, flags | os.O_NONBLOCK)

        self.proc = subprocess.Popen(
            self.cmd,
            stdin=self.slave_fd,
            stdout=self.slave_fd,
            stderr=self.slave_fd,
            cwd=self.cwd,
            env=self.env,
            close_fds=True,
            preexec_fn=os.setsid,
        )
        self.is_running = True

    def read_output(self):
        if not self.master_fd:
            return
        try:
            raw = os.read(self.master_fd, 8192)
            if not raw:
                return
            text = raw.decode("utf-8", errors="replace")
            text = text.replace("\r\n", "\n").replace("\r", "").replace("\t", "    ")
            combined = self.partial_line + text
            parts = combined.split("\n")
            for part in parts[:-1]:
                self.lines.append(clean_ansi(part))
                with open(f".logs/{self.name.split(' ')[0].lower()}.log", "a") as logfile:
                    logfile.write(clean_ansi(part) + "\n")
            self.partial_line = parts[-1]
            if self.scroll_offset > 0:
                self.scroll_offset = 0  # auto-scroll on new data
        except (BlockingIOError, OSError):
            pass

    def send_input(self, char: str):
        if self.master_fd and self.is_running:
            try:
                os.write(self.master_fd, char.encode("utf-8"))
            except OSError:
                pass

    def check_status(self):
        if self.proc and self.is_running:
            poll = self.proc.poll()
            if poll is not None:
                self.is_running = False
        return self.is_running

    def terminate(self):
        if self.proc and self.proc.poll() is None:
            try:
                os.killpg(os.getpgid(self.proc.pid), signal.SIGTERM)
            except Exception:
                try:
                    self.proc.terminate()
                except Exception:
                    pass
        if self.master_fd:
            try: os.close(self.master_fd)
            except OSError: pass
            self.master_fd = None
        if self.slave_fd:
            try: os.close(self.slave_fd)
            except OSError: pass
            self.slave_fd = None
        self.is_running = False

class InternalProcessPTY(SubprocessPTY):
    # A dummy class to emulate a PTY process but inject logs internally
    def __init__(self, name: str, cwd: str):
        super().__init__(name, [], cwd)
        self.is_running = True
        self.master_fd = None

    def start(self):
        self.is_running = True
        
    def write_internal(self, line: str):
        self.lines.append(clean_ansi(line))
        with open(f".logs/{self.name.split(' ')[0].lower()}.log", "a") as logfile:
            logfile.write(clean_ansi(line) + "\n")
            
    def read_output(self):
        pass
    def send_input(self, char: str):
        pass
    def check_status(self):
        return True
    def terminate(self):
        self.is_running = False

def run_tui(stdscr):
    # Initialize curses settings
    curses.curs_set(0)
    stdscr.scrollok(False)
    stdscr.idlok(False)
    stdscr.nodelay(True)
    curses.use_default_colors()

    # Define color pairs (BTOP aesthetic: Emerald, Slate, Cyan, Red)
    curses.init_pair(1, curses.COLOR_GREEN, -1)   # Active/Success
    curses.init_pair(2, curses.COLOR_CYAN, -1)    # Focus / Accent
    curses.init_pair(3, curses.COLOR_YELLOW, -1)  # Warning / Meta
    curses.init_pair(4, curses.COLOR_RED, -1)     # Error / Stopped
    curses.init_pair(5, curses.COLOR_WHITE, -1)   # Text Primary
    curses.init_pair(7, curses.COLOR_BLACK, curses.COLOR_CYAN) # Badge Focus

    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend")
    frontend_dir = os.path.join(project_root, "frontend")

    # Determine backend python interpreter
    backend_venv_python = os.path.join(backend_dir, "venv", "bin", "python3")
    py_exec = backend_venv_python if os.path.exists(backend_venv_python) else sys.executable
    uvicorn_exec = os.path.join(backend_dir, "venv", "bin", "uvicorn")

    # Build PTYs
    frontend_args = ["bun", "run", "dev", "-p", "3000"] + sys.argv[1:]
    env=os.environ.copy(); env["EXPO_NO_DEV_TOOLS"] = "1"
    frontend = SubprocessPTY("Frontend [Next.js]", frontend_args, frontend_dir, env=env)
    backend = SubprocessPTY("Backend [FastAPI]", [uvicorn_exec, "main:app", "--host", "0.0.0.0", "--port", "8000"], backend_dir)
    model = InternalProcessPTY("Model [Stats]", project_root)

    panes = [model, backend, frontend]
    focus_idx = 0 

    frontend.start()
    backend.start()
    model.start()
    
    def model_loop():
        model.write_internal("🧬 BioDex Model Tracker Initialized.")
        model.write_internal("-------------------------------------")
        while model.is_running:
            sz = "Not Found"
            if os.path.exists("backend/paligemma_service.py"):
                sz = "3.0B Params (Cloud API)"
            model.write_internal(f"[{time.strftime('%H:%M:%S')}] Model File: {sz}")
            
            if os.path.exists("model/training_history.json"):
                try:
                    import json
                    with open("model/training_history.json") as f:
                        d = json.load(f)
                        model.write_internal(f"Val Accuracy: {d['phase2_val_acc'][-1] * 100:.2f}%")
                except: pass
                
            model.write_internal("Watching for ML inference signals...")
            time.sleep(8)
            
    threading.Thread(target=model_loop, daemon=True).start()

    def cleanup_all():
        frontend.terminate()
        backend.terminate()
        model.terminate()

    while True:
        # Read subprocess outputs
        frontend.read_output()
        backend.read_output()
        
        frontend.check_status()
        backend.check_status()

        # Handle user input
        try:
            key = stdscr.getch()
        except:
            key = -1

        if key != -1:
            if key in (ord("q"), ord("Q")):
                break
            elif key == 9:  # Tab key -> Switch focus between panes
                focus_idx = (focus_idx + 1) % 3
            elif key in (curses.KEY_UP, ord("k")):
                panes[focus_idx].scroll_offset += 3
            elif key in (curses.KEY_DOWN, ord("j")):
                panes[focus_idx].scroll_offset = max(0, panes[focus_idx].scroll_offset - 3)
            elif key in (ord("c"), ord("C")):
                panes[focus_idx].lines.clear()
            elif key in (ord("w"), ord("W")):
                import webbrowser
                webbrowser.open("http://localhost:3000")
            elif key in (ord("r"), ord("R")):
                if focus_idx == 2: panes[focus_idx].send_input("r")
            elif key in (curses.KEY_RESIZE,):
                stdscr.clear()
            else:
                if 0 <= key <= 255:
                    panes[focus_idx].send_input(chr(key))

        # Render Layout (BTOP Style 3-columns)
        max_y, max_x = stdscr.getmaxyx()
        if max_y < 8 or max_x < 60:
            stdscr.erase()
            stdscr.addstr(0, 0, "Terminal too small for BioDex TUI.", curses.color_pair(4))
            stdscr.refresh()
            curses.napms(80)
            continue

        stdscr.erase()

        # 1. Top Header Bar
        title = "🌿 BioDex Operations Center"
        stdscr.addstr(0, 1, title, curses.color_pair(1) | curses.A_BOLD)
        geo_str = f"[{max_x}x{max_y}]"
        if max_x > 60:
            stdscr.addstr(0, max_x - len(geo_str) - 2, geo_str, curses.color_pair(3))

        # 2. Triple column calculation
        header_height = 2
        footer_height = 1
        content_height = max_y - header_height - footer_height

        col_w = max_x // 3
        pane_configs = [
            {"pane": model, "y": header_height, "x": 0, "h": content_height, "w": col_w, "is_focus": (focus_idx == 0)},
            {"pane": backend, "y": header_height, "x": col_w, "h": content_height, "w": col_w, "is_focus": (focus_idx == 1)},
            {"pane": frontend, "y": header_height, "x": col_w * 2, "h": content_height, "w": max_x - (col_w * 2), "is_focus": (focus_idx == 2)}
        ]

        # 3. Draw Panes
        for cfg in pane_configs:
            py, px, ph, pw = cfg["y"], cfg["x"], cfg["h"], cfg["w"]
            p_obj = cfg["pane"]
            is_focus = cfg["is_focus"]

            border_color = curses.color_pair(2) | curses.A_BOLD if is_focus else (curses.color_pair(1) if p_obj.is_running else curses.color_pair(4))

            # Horizontal Borders
            for col in range(pw):
                try:
                    stdscr.addch(py, px + col, "─", border_color)
                    stdscr.addch(py + ph - 1, px + col, "─", border_color)
                except:
                    pass
            # Vertical Borders
            for row in range(ph):
                try:
                    stdscr.addch(py + row, px, "│", border_color)
                    stdscr.addch(py + row, px + pw - 1, "│", border_color)
                except:
                    pass
            # Corners
            try:
                stdscr.addch(py, px, "╭", border_color)
                stdscr.addch(py, px + pw - 1, "╮", border_color)
                stdscr.addch(py + ph - 1, px, "╰", border_color)
                stdscr.addch(py + ph - 1, px + pw - 1, "╯", border_color)
            except: pass

            # Title
            tag = " [ACTIVE] " if is_focus else ""
            title_text = f" {p_obj.name}{tag} "
            try: stdscr.addstr(py, px + 2, title_text[:pw - 4], border_color)
            except: pass

            # Lines
            inner_h, inner_w = ph - 2, pw - 2
            lines_list = list(p_obj.lines)
            max_scroll = max(0, len(lines_list) - inner_h)
            p_obj.scroll_offset = min(p_obj.scroll_offset, max_scroll)
            start_idx = max(0, len(lines_list) - inner_h - p_obj.scroll_offset)
            
            for i, line in enumerate(lines_list[start_idx:start_idx+inner_h]):
                line_color = curses.color_pair(5)
                # Quick syntax highlighting
                if "ERROR" in line or "Exception" in line or "Failed" in line: line_color = curses.color_pair(4)
                elif "WARN" in line.upper(): line_color = curses.color_pair(3)
                elif "200 OK" in line: line_color = curses.color_pair(1)
                
                try: stdscr.addstr(py + 1 + i, px + 1, truncate_display(line, inner_w), line_color)
                except: pass

        # 4. Bottom Footer Keybindings
        footer_y = max_y - 1
        footer_str = " [Tab] Switch Focus   [↑/↓] Scroll   [C] Clear   [W] Web (Frontend)  [R] Reload (Frontend)  [Q] Quit    (*Logs dumped to .logs/ for copying) "
        try:
            stdscr.addstr(footer_y, 0, footer_str[:max_x - 1], curses.color_pair(7) | curses.A_BOLD)
        except: pass

        stdscr.refresh()
        curses.napms(40)

    cleanup_all()

def main():
    try: curses.wrapper(run_tui)
    except KeyboardInterrupt: pass
    print("\n🌿 BioDex operations flawlessly terminated.\n")

if __name__ == "__main__":
    main()
