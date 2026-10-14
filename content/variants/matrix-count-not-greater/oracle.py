def countNotGreater(matrix, target):
    return sum(1 for row in matrix for x in row if x <= target)
