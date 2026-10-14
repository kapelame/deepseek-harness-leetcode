PAIRS = {"(": ")", "[": "]", "{": "}"}


def _balanced(rng, n):
    out = []
    stack = []
    while len(out) + len(stack) < n:
        if stack and (rng.random() < 0.5 or len(out) + len(stack) + 2 > n):
            out.append(PAIRS[stack.pop()])
        else:
            opener = rng.choice("([{")
            stack.append(opener)
            out.append(opener)
    while stack:
        out.append(PAIRS[stack.pop()])
    return "".join(out)


def adjust(args, rng, size):
    text = args[0]
    if rng.random() < 0.6:
        text = _balanced(rng, max(2, len(text) - len(text) % 2))
        if rng.random() < 0.3:
            i = rng.randrange(len(text))
            text = text[:i] + rng.choice("()[]{}") + text[i + 1:]
    return [text]
