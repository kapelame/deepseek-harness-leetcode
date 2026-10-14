def setZeroes(matrix):
    original = [row[:] for row in matrix]
    for i, row in enumerate(original):
        for j, value in enumerate(row):
            if value == 0:
                for c in range(len(row)):
                    matrix[i][c] = 0
                for r in range(len(original)):
                    matrix[r][j] = 0
