def adjust(args, rng, size):
    grid, _ = args
    rows, cols = len(grid), len(grid[0])
    values = sorted(rng.sample(range(-10000, 10001), rows * cols))
    matrix = [values[r * cols:(r + 1) * cols] for r in range(rows)]
    target = rng.choice(values) if rng.random() < 0.5 else rng.randint(values[0] - 2, values[-1] + 2)
    return [matrix, target]
