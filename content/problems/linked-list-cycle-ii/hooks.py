def adjust(args, rng, size):
    values, _ = args
    pos = -1 if not values or rng.random() < 0.3 else rng.randrange(len(values))
    return [values, pos]
