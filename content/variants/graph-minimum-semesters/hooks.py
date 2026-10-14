def adjust(args, rng, size):
    n = rng.randint(1, 7) if size == "small" else 5000
    edges = rng.randint(0, min(9, n * n)) if size == "small" else 5000
    order = list(range(n))
    rng.shuffle(order)
    rank = {course: i for i, course in enumerate(order)}
    pairs = set()
    tries = 0
    while len(pairs) < edges and tries < edges * 20:
        tries += 1
        a, b = rng.randrange(n), rng.randrange(n)
        if a != b and rank[b] < rank[a]:
            pairs.add((a, b))
    pairs = [list(p) for p in pairs]
    if pairs and rng.random() < 0.3:
        a, b = rng.choice(pairs)
        if [b, a] not in pairs:
            pairs.append([b, a])
    rng.shuffle(pairs)
    return [n, pairs]
