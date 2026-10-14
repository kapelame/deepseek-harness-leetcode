def adjust(args, rng, size):
    n = len(args[0])
    return [[[rng.randint(-1000, 1000) for _ in range(n)] for _ in range(n)]]
