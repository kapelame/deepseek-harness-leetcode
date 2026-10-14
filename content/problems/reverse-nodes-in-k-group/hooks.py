def adjust(args, rng, size):
    values, _ = args
    return [values, rng.randint(1, len(values))]
