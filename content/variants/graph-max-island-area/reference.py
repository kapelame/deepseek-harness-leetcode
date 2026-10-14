def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    best = 0
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == 1:
                grid[i][j] = 0
                stack, area = [(i, j)], 0
                while stack:
                    r, c = stack.pop()
                    area += 1
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                            grid[nr][nc] = 0
                            stack.append((nr, nc))
                best = max(best, area)
    return best
