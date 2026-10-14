import itertools
def solveNQueens(n):
    out = []
    for perm in itertools.permutations(range(n)):
        if len({r - c for r, c in enumerate(perm)}) == n and len({r + c for r, c in enumerate(perm)}) == n:
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in perm])
    return out
