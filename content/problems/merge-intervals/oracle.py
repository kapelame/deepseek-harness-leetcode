def merge(intervals):
    parts = [list(item) for item in intervals]
    changed = True
    while changed:
        changed = False
        for i in range(len(parts)):
            for j in range(i + 1, len(parts)):
                a, b = parts[i], parts[j]
                if a[0] <= b[1] and b[0] <= a[1]:
                    parts[i] = [min(a[0], b[0]), max(a[1], b[1])]
                    parts.pop(j)
                    changed = True
                    break
            if changed:
                break
    return parts
