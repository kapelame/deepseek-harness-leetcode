def searchMatrix(matrix, target):
    return any(target in row for row in matrix)
