def adjust(args, rng, size):
    values = args[0]
    if rng.random() < 0.5:
        half = values[:(len(values) + 1) // 2]
        values = half + half[:len(values) // 2][::-1]
    return [values]
