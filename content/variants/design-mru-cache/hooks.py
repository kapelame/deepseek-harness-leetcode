def adjust(args, rng, size):
    capacity = rng.randint(1, 3) if size == "small" else 100
    count = rng.randint(1, 12) if size == "small" else 8000
    keys = 5 if size == "small" else 300
    ops, values = ["MRUCache"], [[capacity]]
    for _ in range(count):
        if rng.random() < 0.5:
            ops.append("get")
            values.append([rng.randrange(keys)])
        else:
            ops.append("put")
            values.append([rng.randrange(keys), rng.randint(0, 100000)])
    return [ops, values]
