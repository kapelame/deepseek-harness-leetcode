def rotateLeft(matrix):
    n = len(matrix)
    copy = [row[:] for row in matrix]
    for i in range(n):
        for j in range(n):
            matrix[n - 1 - j][i] = copy[i][j]
