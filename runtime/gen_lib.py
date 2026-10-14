# Generic seeded input generation from declarative parameter domains. The
# Learn suite builder prepends this library to a generated `generate(seed,
# size)` entry, so most problems need no hand-written generator. Optional
# hooks: `adjust(args, rng, size)` rewrites a candidate (for example to plant
# an answer) and `valid(args)` rejects candidates that break a precondition.
# A `json` domain yields None; its adjust() hook builds the structured value,
# such as design-problem operation lists or harness inputs.
import random

_LETTERS = "abcdefghijklmnopqrstuvwxyz"


def _length(domain, rng, size):
    low = domain.get("minLength", 0)
    if size == "large":
        return domain.get("largeLength", domain.get("maxLength", 10))
    return rng.randint(low, min(domain.get("maxLength", 10), domain.get("smallMaxLength", 10)))


def _int(domain, rng, size):
    low, high = domain.get("min", -10 ** 9), domain.get("max", 10 ** 9)
    if size == "small" and "smallMin" in domain:
        low, high = domain["smallMin"], domain.get("smallMax", high)
    return rng.randint(low, high)


def _ints(domain, rng, size):
    n = _length(domain, rng, size)
    low, high = domain.get("min", -10 ** 9), domain.get("max", 10 ** 9)
    if size == "small" and "smallMin" in domain:
        low, high = domain["smallMin"], domain.get("smallMax", high)
    if domain.get("distinct"):
        n = min(n, high - low + 1)
        values = rng.sample(range(low, high + 1), n)
    else:
        values = [rng.randint(low, high) for _ in range(n)]
    order = domain.get("sorted")
    if order == "asc":
        values.sort()
    elif order == "desc":
        values.sort(reverse=True)
    return values


def _string(domain, rng, size, n=None):
    alphabet = domain.get("alphabet", _LETTERS)
    if size == "small" and "smallAlphabet" in domain:
        alphabet = domain["smallAlphabet"]
    n = _length(domain, rng, size) if n is None else n
    return "".join(rng.choice(alphabet) for _ in range(n))


def _strings(domain, rng, size):
    n = _length(domain, rng, size)
    word = dict(domain.get("word", {}))
    if size == "small":
        word["maxLength"] = min(word.get("maxLength", 6), word.get("smallMaxLength", 6))
    return [_string(word, rng, "small") for _ in range(n)]


def _matrix(domain, rng, size):
    rows = _length(domain, rng, size)
    cols = _length(domain.get("row", {}), rng, size)
    cell = domain.get("cell", {})
    if domain.get("type") == "string[][]":
        return [[_string(cell, rng, "small") for _ in range(cols)] for _ in range(rows)]
    return [[_int(cell, rng, size) for _ in range(cols)] for _ in range(rows)]


def _tree(domain, rng, size):
    count = _length(domain, rng, size)
    if count == 0:
        return []
    values = [_int(domain, rng, size) for _ in range(count)]
    shape = domain.get("shape", "random") if size == "large" else "random"
    slots = [0]
    children = {0: [None, None]}
    for index in range(1, count):
        if shape == "chain":
            parent = index - 1
            side = 0 if rng.random() < 0.5 else 1
        else:
            while True:
                parent = rng.choice(slots)
                side = rng.randint(0, 1)
                if children[parent][side] is None:
                    break
        children[parent][side] = index
        children[index] = [None, None]
        slots.append(index)
        slots = [slot for slot in slots if None in children[slot]]
    out = []
    queue = [0]
    head = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            out.append(None)
            continue
        out.append(values[node])
        queue.append(children[node][0])
        queue.append(children[node][1])
    while out and out[-1] is None:
        out.pop()
    return out


def _value(domain, rng, size):
    kind = domain["type"]
    if kind == "int":
        return _int(domain, rng, size)
    if kind == "float":
        return round(rng.uniform(domain.get("min", -1000.0), domain.get("max", 1000.0)), domain.get("digits", 3))
    if kind == "bool":
        return rng.random() < 0.5
    if kind == "string":
        return _string(domain, rng, size)
    if kind in ("int[]", "linked-list"):
        return _ints(domain, rng, size)
    if kind == "float[]":
        return [round(rng.uniform(domain.get("min", -1000.0), domain.get("max", 1000.0)), domain.get("digits", 3)) for _ in range(_length(domain, rng, size))]
    if kind == "bool[]":
        return [rng.random() < 0.5 for _ in range(_length(domain, rng, size))]
    if kind == "string[]":
        return _strings(domain, rng, size)
    if kind in ("int[][]", "string[][]"):
        return _matrix(domain, rng, size)
    if kind == "tree":
        return _tree(domain, rng, size)
    if kind == "linked-list[]":
        inner = dict(domain.get("row", {}))
        for key in ("min", "max", "smallMin", "smallMax", "sorted", "distinct"):
            if key in domain:
                inner[key] = domain[key]
        return [_ints(inner, rng, size) for _ in range(_length(domain, rng, size))]
    if kind == "json":
        # Structured arguments (design operations, harness inputs) are built by an adjust() hook.
        return None
    raise ValueError("unsupported domain type %s" % kind)


def generate_from_domains(domains, seed, size, adjust=None, valid=None, attempts=2000):
    rng = random.Random(seed)
    for _ in range(attempts):
        args = [_value(domain, rng, size) for domain in domains]
        if adjust is not None:
            args = adjust(args, rng, size)
            if args is None:
                continue
        if valid is None or valid(args):
            return args
    raise ValueError("no valid input after %d attempts; relax the domains or the valid() hook" % attempts)
