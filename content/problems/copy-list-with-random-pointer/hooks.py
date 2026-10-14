def adjust(args, rng, size):
    n = rng.randint(0, 7) if size == "small" else 1000
    return [[[rng.randint(-10000, 10000), (rng.randrange(n) if rng.random() < 0.7 else None)] for _ in range(n)]]
