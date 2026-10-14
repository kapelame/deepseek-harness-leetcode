def countNotGreater(matrix, target):
    i, j = len(matrix) - 1, 0
    count = 0
    while i >= 0 and j < len(matrix[0]):
        if matrix[i][j] < target:
            count += i + 1
            j += 1
        else:
            i -= 1
    return count
