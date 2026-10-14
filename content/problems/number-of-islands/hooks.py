def adjust(args, rng, size):
    grid = args[0]
    return [[[("1" if rng.random() < 0.45 else "0") for _ in row] for row in grid]]
