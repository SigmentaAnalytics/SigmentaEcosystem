from typing import List, Tuple, Dict

def generate_activity_heatmap(
    timestamps: List[int],
    counts: List[int],
    buckets: int = 10,
    normalize: bool = True
) -> List[float]:
    """
    Bucket activity counts into 'buckets' time intervals,
    returning either raw counts or normalized [0.0–1.0].
    - timestamps: list of epoch ms timestamps.
    - counts: list of integer counts per timestamp.
    """
    if not timestamps or not counts or len(timestamps) != len(counts):
        return []

    t_min, t_max = min(timestamps), max(timestamps)
    span = t_max - t_min or 1
    bucket_size = span / buckets

    agg = [0] * buckets
    for t, c in zip(timestamps, counts):
        idx = min(buckets - 1, int((t - t_min) / bucket_size))
        agg[idx] += c

    if normalize:
        m = max(agg) or 1
        return [round(val / m, 4) for val in agg]
    return agg


def heatmap_with_labels(
    timestamps: List[int],
    counts: List[int],
    buckets: int = 10,
    normalize: bool = True
) -> Dict[str, float]:
    """
    Return a dict of bucket ranges -> values for better interpretability.
    Example: {"0-10%": 0.3, "10-20%": 0.6, ...}
    """
    values = generate_activity_heatmap(timestamps, counts, buckets, normalize)
    labels = [f"{int(i * 100 / buckets)}-{int((i+1) * 100 / buckets)}%" for i in range(buckets)]
    return {label: val for label, val in zip(labels, values)}


def detect_peak_bucket(heatmap: List[float]) -> Tuple[int, float]:
    """
    Find the index and value of the peak bucket in a heatmap.
    """
    if not heatmap:
        return -1, 0.0
    max_val = max(heatmap)
    idx = heatmap.index(max_val)
    return idx, max_val
