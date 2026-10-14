def coinChange(coins, amount):
    if amount == 0:
        return 0
    level, frontier, seen = 0, {0}, {0}
    while frontier:
        level += 1
        nxt = set()
        for value in frontier:
            for c in coins:
                total = value + c
                if total == amount:
                    return level
                if total < amount and total not in seen:
                    seen.add(total)
                    nxt.add(total)
        frontier = nxt
    return -1
