def maxAreaOfIsland(grid):
    cells = [(i, j) for i, row in enumerate(grid) for j, v in enumerate(row) if v == 1]
    label = {cell: k for k, cell in enumerate(cells)}
    changed = True
    while changed:
        changed = False
        for (i, j) in cells:
            for other in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                if other in label and label[other] < label[(i, j)]:
                    label[(i, j)] = label[other]
                    changed = True
    sizes = {}
    for cell in cells:
        sizes[label[cell]] = sizes.get(label[cell], 0) + 1
    return max(sizes.values(), default=0)
