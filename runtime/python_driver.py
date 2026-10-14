# Learn judge driver for Python submissions. It runs inside an isolated
# container, reads one JSON request from stdin, and writes nonce-prefixed JSON
# events to the original stdout descriptor. Submission output is captured and
# bounded; expected values never reach this process.
import json
import os
import signal
import sys
import time
import traceback


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self):
        return "TreeNode(%r)" % (self.val,)


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class _CaseTimeout(BaseException):
    pass


class _Capture:
    def __init__(self, limit):
        self.limit = limit
        self.parts = []
        self.size = 0
        self.truncated = False

    def write(self, text):
        if not isinstance(text, str):
            text = str(text)
        room = self.limit - self.size
        if room <= 0:
            self.truncated = True
            return len(text)
        piece = text[:room]
        self.parts.append(piece)
        self.size += len(piece)
        if len(piece) < len(text):
            self.truncated = True
        return len(text)

    def flush(self):
        pass

    def take(self):
        text = "".join(self.parts)
        truncated = self.truncated
        self.parts = []
        self.size = 0
        self.truncated = False
        return text, truncated


def _main():
    request = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    nonce = request["nonce"]
    out_fd = os.dup(1)
    null_fd = os.open(os.devnull, os.O_WRONLY)
    os.dup2(null_fd, 1)
    os.dup2(null_fd, 2)
    max_value_bytes = int(request["maxValueBytes"])

    def emit(event):
        data = (nonce + " " + json.dumps(event, separators=(",", ":"), allow_nan=False) + "\n").encode("utf-8")
        view = memoryview(data)
        while len(view) > 0:
            written = os.write(out_fd, view)
            view = view[written:]

    def on_alarm(_signum, _frame):
        raise _CaseTimeout()

    signal.signal(signal.SIGALRM, on_alarm)

    def arm(ms):
        signal.setitimer(signal.ITIMER_REAL, ms / 1000.0)

    def disarm():
        signal.setitimer(signal.ITIMER_REAL, 0)

    def solution_line(tb):
        line = None
        for frame in traceback.extract_tb(tb):
            if frame.filename == "<solution>":
                line = frame.lineno
        return line

    def decode(kind, value):
        if kind == "tree":
            return _build_tree(value)
        if kind == "linked-list":
            head = None
            for item in reversed(value):
                head = ListNode(item, head)
            return head
        return value

    def encode(kind, value):
        if kind == "tree":
            return _serialize_tree(value)
        if kind == "linked-list":
            out = []
            seen = 0
            while value is not None:
                seen += 1
                if seen > 100000:
                    raise ValueError("linked list is too long or contains a cycle")
                out.append(value.val)
                value = value.next
            return out
        return _plain(value)

    capture = _Capture(int(request["maxStdoutChars"]))
    sys.stdout = capture
    sys.stderr = capture
    sys.setrecursionlimit(int(request["recursionLimit"]))

    try:
        compiled = compile(request["code"], "<solution>", "exec")
    except SyntaxError as error:
        emit({"type": "compile-error", "message": "%s: %s" % (type(error).__name__, error.msg), "line": error.lineno})
        return
    except ValueError as error:
        emit({"type": "compile-error", "message": str(error), "line": None})
        return

    namespace = {"__name__": "solution", "__builtins__": __builtins__}
    exec(_PRELUDE, namespace)
    namespace["TreeNode"] = TreeNode
    namespace["ListNode"] = ListNode
    try:
        arm(int(request["moduleTimeMs"]))
        exec(compiled, namespace)
        disarm()
    except _CaseTimeout:
        emit({"type": "module-error", "kind": "timeout", "message": "Module initialization exceeded the time limit", "line": None})
        return
    except BaseException as error:
        disarm()
        emit({"type": "module-error", "kind": "runtime", "message": "%s: %s" % (type(error).__name__, error), "line": solution_line(error.__traceback__)})
        return

    entry_name = request["entry"]
    entry = None
    holder = namespace.get("Solution")
    if isinstance(holder, type) and callable(getattr(holder, entry_name, None)):
        try:
            entry = getattr(holder(), entry_name)
        except BaseException as error:
            emit({"type": "module-error", "kind": "runtime", "message": "Solution() failed: %s: %s" % (type(error).__name__, error), "line": solution_line(error.__traceback__)})
            return
    elif callable(namespace.get(entry_name)):
        entry = namespace[entry_name]
    if entry is None:
        emit({"type": "compile-error", "message": "Define class Solution with method %s, or a top-level function %s" % (entry_name, entry_name), "line": None})
        return

    emit({"type": "ready"})
    params = request["params"]
    returns = request["returns"]
    per_case_ms = int(request["perCaseMs"])
    for case in request["cases"]:
        emit({"type": "start", "id": case["id"]})
        capture.take()
        try:
            args = [decode(kind, value) for kind, value in zip(params, case["args"])]
        except BaseException as error:
            emit({"type": "driver-error", "message": "Cannot decode case %s: %s" % (case["id"], error)})
            return
        started = time.perf_counter()
        try:
            arm(per_case_ms)
            result = entry(*args)
            disarm()
        except _CaseTimeout:
            output, truncated = capture.take()
            emit({"type": "case", "id": case["id"], "ok": False, "error": {"kind": "timeout", "message": "Exceeded %d ms" % per_case_ms, "line": None}, "timeMs": per_case_ms, "stdout": output, "stdoutTruncated": truncated})
            return
        except RecursionError as error:
            disarm()
            output, truncated = capture.take()
            emit({"type": "case", "id": case["id"], "ok": False, "error": {"kind": "runtime", "message": "RecursionError: %s" % error, "line": solution_line(error.__traceback__)}, "timeMs": _ms(started), "stdout": output, "stdoutTruncated": truncated})
            continue
        except MemoryError:
            disarm()
            output, truncated = capture.take()
            emit({"type": "case", "id": case["id"], "ok": False, "error": {"kind": "memory", "message": "MemoryError", "line": None}, "timeMs": _ms(started), "stdout": output, "stdoutTruncated": truncated})
            return
        except BaseException as error:
            disarm()
            output, truncated = capture.take()
            emit({"type": "case", "id": case["id"], "ok": False, "error": {"kind": "runtime", "message": "%s: %s" % (type(error).__name__, error), "line": solution_line(error.__traceback__)}, "timeMs": _ms(started), "stdout": output, "stdoutTruncated": truncated})
            continue
        elapsed = _ms(started)
        output, truncated = capture.take()
        try:
            value = encode(returns, result)
            size = len(json.dumps(value, separators=(",", ":"), allow_nan=False))
        except (TypeError, ValueError) as error:
            emit({"type": "case", "id": case["id"], "ok": False, "error": {"kind": "invalid-output", "message": "Returned value is not valid for %s: %s" % (returns, error), "line": None}, "timeMs": elapsed, "stdout": output, "stdoutTruncated": truncated})
            continue
        if size > max_value_bytes:
            emit({"type": "case", "id": case["id"], "ok": False, "error": {"kind": "output-limit", "message": "Returned value exceeds %d bytes" % max_value_bytes, "line": None}, "timeMs": elapsed, "stdout": output, "stdoutTruncated": truncated})
            return
        emit({"type": "case", "id": case["id"], "ok": True, "value": value, "timeMs": elapsed, "stdout": output, "stdoutTruncated": truncated})
    emit({"type": "done"})


_PRELUDE = """
from typing import *
import collections, heapq, bisect, math, itertools, functools, string, re
from collections import deque, defaultdict, Counter, OrderedDict
from math import inf
"""


def _ms(started):
    return round((time.perf_counter() - started) * 1000, 3)


def _plain(value):
    if value is None or isinstance(value, (bool, int, str)):
        return value
    if isinstance(value, float):
        if value != value or value in (float("inf"), float("-inf")):
            raise ValueError("non-finite float")
        return value
    if isinstance(value, (list, tuple)):
        return [_plain(item) for item in value]
    if isinstance(value, (set, frozenset)):
        return [_plain(item) for item in value]
    if isinstance(value, dict):
        raise TypeError("dict results are not supported")
    raise TypeError("unsupported result type %s" % type(value).__name__)


def _build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    index = 1
    head = 0
    while head < len(queue) and index < len(values):
        node = queue[head]
        head += 1
        if index < len(values) and values[index] is not None:
            node.left = TreeNode(values[index])
            queue.append(node.left)
        index += 1
        if index < len(values) and values[index] is not None:
            node.right = TreeNode(values[index])
            queue.append(node.right)
        index += 1
    return root


def _serialize_tree(root):
    if root is None:
        return []
    out = []
    queue = [root]
    head = 0
    seen = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            out.append(None)
            continue
        seen += 1
        if seen > 100000:
            raise ValueError("tree is too large or contains a cycle")
        if not isinstance(node, TreeNode):
            raise TypeError("expected TreeNode, got %s" % type(node).__name__)
        out.append(_plain(node.val))
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


_main()
