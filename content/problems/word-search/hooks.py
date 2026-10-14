def adjust(args, rng, size):
    board, word = args
    board = [[cell if cell else "a" for cell in row] for row in board]
    if rng.random() < 0.5:
        rows, cols = len(board), len(board[0])
        r, c = rng.randrange(rows), rng.randrange(cols)
        path = [(r, c)]
        while len(path) < min(len(word), rows * cols):
            options = [(r + dr, c + dc) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
                       if 0 <= r + dr < rows and 0 <= c + dc < cols and (r + dr, c + dc) not in path]
            if not options:
                break
            r, c = rng.choice(options)
            path.append((r, c))
        word = "".join(board[i][j] for i, j in path)
    return [board, word]
