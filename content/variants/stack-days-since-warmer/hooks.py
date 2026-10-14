def adjust(args, rng, size):
    temperatures = args[0]
    if size == "large":
        temperatures = sorted(temperatures)
    return [temperatures]
