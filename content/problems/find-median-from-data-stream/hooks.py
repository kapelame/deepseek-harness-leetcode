def adjust(args, rng, size):
    count = rng.randint(1, 12) if size == "small" else 8000
    low, high = (-5, 5) if size == "small" else (-100000, 100000)
    ops, values, added = ["MedianFinder"], [[]], 0
    for _ in range(count):
        if added and rng.random() < 0.4:
            ops.append("findMedian")
            values.append([])
        else:
            ops.append("addNum")
            values.append([rng.randint(low, high)])
            added += 1
    return [ops, values]
