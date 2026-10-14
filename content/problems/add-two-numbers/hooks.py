def adjust(args, rng, size):
    out = []
    for digits in args:
        digits = list(digits)
        if len(digits) > 1 and digits[-1] == 0:
            digits[-1] = rng.randint(1, 9)
        out.append(digits)
    return out
