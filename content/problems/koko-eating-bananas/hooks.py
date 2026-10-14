def adjust(args, rng, size):
    piles = args[0]
    n = len(piles)
    h = rng.randint(n, n + 12) if size == "small" else rng.randint(n, n * 3)
    return [piles, h]
