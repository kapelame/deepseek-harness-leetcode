def adjust(args, rng, size):
    def build(depth):
        parts = []
        for _ in range(rng.randint(1, 2)):
            if depth < 2 and rng.random() < 0.5:
                parts.append(str(rng.randint(1, 4 if size == "small" else 12)) + "[" + build(depth + 1) + "]")
            else:
                parts.append("".join(rng.choice("abc") for _ in range(rng.randint(1, 2))))
        return "".join(parts)
    while True:
        s = build(0)
        if len(s) <= 30:
            return [s]
