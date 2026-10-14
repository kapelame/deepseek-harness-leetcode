def adjust(args, rng, size):
    intervals = args[0]
    limit = 20 if size == "small" else 10000
    out = []
    for _ in intervals:
        a = rng.randint(0, limit)
        b = min(limit, a + rng.randint(0, 3 if size == "small" else 30))
        out.append([a, b])
    return [out]
