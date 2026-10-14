def minPathSum(grid):
    n = len(grid[0])
    row = [0] * n
    for i, values in enumerate(grid):
        for j, v in enumerate(values):
            if i == 0 and j == 0:
                row[j] = v
            elif i == 0:
                row[j] = row[j - 1] + v
            elif j == 0:
                row[j] = row[j] + v
            else:
                row[j] = min(row[j], row[j - 1]) + v
    return row[-1]
