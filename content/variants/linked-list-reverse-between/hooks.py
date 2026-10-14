def adjust(args, rng, size):
    values, _, _ = args
    left = rng.randint(1, len(values))
    right = rng.randint(left, len(values))
    return [values, left, right]
