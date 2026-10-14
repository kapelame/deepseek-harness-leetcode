def combinationSum2(candidates, target):
    found = set()
    def walk(i, remain, chosen):
        if remain == 0:
            found.add(tuple(sorted(chosen)))
            return
        if i == len(candidates) or remain < 0:
            return
        walk(i + 1, remain - candidates[i], chosen + [candidates[i]])
        walk(i + 1, remain, chosen)
    walk(0, target, [])
    return [list(c) for c in found]
