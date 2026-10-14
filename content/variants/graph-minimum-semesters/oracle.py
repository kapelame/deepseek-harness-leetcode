def minimumSemesters(n, relations):
    done = set()
    semesters = 0
    while len(done) < n:
        ready = [c for c in range(n) if c not in done and all(b in done for a, b in relations if a == c)]
        if not ready:
            return -1
        done.update(ready)
        semesters += 1
    return semesters
