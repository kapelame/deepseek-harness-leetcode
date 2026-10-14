def numSquares(n):
    level, frontier, seen = 0, {n}, {n}
    while frontier:
        level += 1
        nxt = set()
        for value in frontier:
            j = 1
            while j * j <= value:
                rest = value - j * j
                if rest == 0:
                    return level
                if rest not in seen:
                    seen.add(rest)
                    nxt.add(rest)
                j += 1
        frontier = nxt
