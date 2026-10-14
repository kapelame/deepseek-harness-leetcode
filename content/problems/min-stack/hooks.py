def adjust(args, rng, size):
    count = rng.randint(1, 12) if size == "small" else 8000
    low, high = (-5, 5) if size == "small" else (-2147483648, 2147483647)
    ops, values, depth = ["MinStack"], [[]], 0
    for _ in range(count):
        kind = "push" if depth == 0 else rng.choice(["push", "push", "pop", "top", "getMin"])
        ops.append(kind)
        if kind == "push":
            values.append([rng.randint(low, high)])
            depth += 1
        else:
            values.append([])
            if kind == "pop":
                depth -= 1
    return [ops, values]
