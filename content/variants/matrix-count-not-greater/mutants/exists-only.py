def countNotGreater(matrix, target):
    return 1 if any(x <= target for row in matrix for x in row) else 0
