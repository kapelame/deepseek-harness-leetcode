def adjust(args, rng, size):
    s, words = args
    words = sorted({w for w in words if w})
    if not words:
        words = ["a"]
    if rng.random() < 0.5:
        pieces = []
        while sum(map(len, pieces)) < len(s):
            pieces.append(rng.choice(words))
        s = "".join(pieces)[:300]
    if size == "large" and rng.random() < 0.5:
        s = "a" * 299 + "b"
        words = ["a", "aa", "aaa", "aaaa", "aaaaa"]
    return [s, words]
