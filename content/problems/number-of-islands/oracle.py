def numIslands(grid):
    cells = [(i, j) for i, row in enumerate(grid) for j, v in enumerate(row) if v == "1"]
    parent = {cell: cell for cell in cells}
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    for i, j in cells:
        for other in ((i + 1, j), (i, j + 1)):
            if other in parent:
                parent[find(other)] = find((i, j))
    return len({find(cell) for cell in cells})
