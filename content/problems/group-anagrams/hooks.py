def adjust(args, rng, size):
    words = args[0]
    bases = words[:max(1, len(words) // 7)]
    grouped = []
    for _ in words:
        letters = list(rng.choice(bases))
        rng.shuffle(letters)
        grouped.append("".join(letters))
    return [grouped]
