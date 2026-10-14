def adjust(args, rng, size):
    words, _ = args
    words = [w if w else "a" for w in words]
    return [words, rng.randint(1, len(set(words)))]
