def adjust(args, rng, size):
    _, list_a, list_b, _, _ = args
    if rng.random() < 0.25:
        return [0, list_a, list_b, len(list_a), len(list_b)]
    skip_a = rng.randrange(len(list_a))
    skip_b = rng.randrange(len(list_b))
    list_b = list_b[:skip_b] + list_a[skip_a:]
    return [list_a[skip_a], list_a, list_b, skip_a, skip_b]
