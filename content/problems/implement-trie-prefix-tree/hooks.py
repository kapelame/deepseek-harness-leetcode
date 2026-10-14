def adjust(args, rng, size):
    count = rng.randint(1, 10) if size == "small" else 4000
    alphabet = "ab" if size == "small" else "abcd"
    words = []
    ops, values = ["Trie"], [[]]
    for _ in range(count):
        kind = rng.choice(["insert", "search", "startsWith"])
        if words and rng.random() < 0.5:
            base = rng.choice(words)
            word = base[:rng.randint(1, len(base))] if kind == "startsWith" else base
        else:
            word = "".join(rng.choice(alphabet) for _ in range(rng.randint(1, 4 if size == "small" else 12)))
        if kind == "insert":
            words.append(word)
        ops.append(kind)
        values.append([word])
    return [ops, values]
