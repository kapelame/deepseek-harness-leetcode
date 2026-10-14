import math
def generate(numRows):
    return [[math.comb(i, j) for j in range(i + 1)] for i in range(numRows)]
