def spiralOrder(matrix):
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    out = []
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            out.append(matrix[top][j])
        for i in range(top + 1, bottom + 1):
            out.append(matrix[i][right])
        if top < bottom and left < right:
            for j in range(right - 1, left - 1, -1):
                out.append(matrix[bottom][j])
            for i in range(bottom - 1, top, -1):
                out.append(matrix[i][left])
        top, bottom, left, right = top + 1, bottom - 1, left + 1, right - 1
    return out
