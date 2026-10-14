def adjust(args, rng, size):
    grid, _ = args
    rows, cols = len(grid), len(grid[0])
    out = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        for j in range(cols):
            base = max(out[i - 1][j] if i else -10, out[i][j - 1] if j else -10)
            out[i][j] = base + rng.randint(1, 3)
    flat = [x for row in out for x in row]
    target = rng.choice(flat) if rng.random() < 0.5 else rng.randint(-12, flat[-1] + 2)
    return [out, target]
