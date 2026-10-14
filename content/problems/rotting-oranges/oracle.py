def orangesRotting(grid):
    grid = [row[:] for row in grid]
    minutes = 0
    while True:
        changes = []
        for i, row in enumerate(grid):
            for j, v in enumerate(row):
                if v == 1 and any(0 <= i + di < len(grid) and 0 <= j + dj < len(row) and grid[i + di][j + dj] == 2
                                  for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    changes.append((i, j))
        if not changes:
            break
        for i, j in changes:
            grid[i][j] = 2
        minutes += 1
    return -1 if any(1 in row for row in grid) else minutes
