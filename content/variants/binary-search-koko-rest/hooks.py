def adjust(args, rng, size):
    piles = args[0]
    n = len(piles)
    h = rng.randint(n, 2 * n + 14) if size == "small" else rng.randint(2 * n - 1, 4 * n)
    return [piles, h]
