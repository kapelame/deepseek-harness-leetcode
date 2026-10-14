def adjust(args, rng, size):
    text = args[0]
    if rng.random() < 0.5:
        half = text[:len(text) // 2]
        middle = text[len(half):len(text) - len(half)]
        text = half + middle + half[::-1]
    return [text]
