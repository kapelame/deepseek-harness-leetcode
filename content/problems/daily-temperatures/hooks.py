def adjust(args, rng, size):
    temperatures = args[0]
    if size == "large" and rng.random() < 0.5:
        temperatures = sorted(temperatures, reverse=True)
    return [temperatures]
