def adjust(args, rng, size):
    count = rng.randint(1, 12) if size == "small" else 8000
    low, high = (-5, 5) if size == "small" else (-1000000000, 1000000000)
    ops, values, length = ["MinQueue"], [[]], 0
    for _ in range(count):
        kind = "push" if length == 0 else rng.choice(["push", "push", "pop", "front", "getMin"])
        ops.append(kind)
        if kind == "push":
            values.append([rng.randint(low, high)])
            length += 1
        else:
            values.append([])
            if kind == "pop":
                length -= 1
    return [ops, values]
