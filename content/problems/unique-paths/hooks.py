import math
def valid(args):
    m, n = args
    return math.comb(m + n - 2, m - 1) <= 2 * 10 ** 9
