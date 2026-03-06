# Panopticon Engine Algorithms

## Overview

This document explains the algorithms and statistical methods used in the Panopticon Engine for anomaly detection, pattern recognition, and trend analysis.

## Anomaly Detection

### 1. Z-Score Method

**Purpose**: Detect statistical outliers based on standard deviation.

**Algorithm**:
```
z = (x - μ) / σ

Where:
- x = observed value
- μ = mean of historical data
- σ = standard deviation
```

**Threshold**: Default is 3σ (99.7% confidence interval)

**Implementation**:
```typescript
const zScore = Math.abs((value - mean) / stdDev);
const isAnomaly = zScore > threshold;
```

**Advantages**:
- Simple and fast
- Works well for normally distributed data
- Easy to interpret

**Limitations**:
- Assumes normal distribution
- Sensitive to extreme outliers in training data

### 2. Interquartile Range (IQR) Method

**Purpose**: Detect outliers using quartile-based bounds.

**Algorithm**:
```
Q1 = 25th percentile
Q3 = 75th percentile
IQR = Q3 - Q1

Lower Bound = Q1 - 1.5 * IQR
Upper Bound = Q3 + 1.5 * IQR

Anomaly if: x < Lower Bound OR x > Upper Bound
```

**Advantages**:
- Robust to outliers
- No distribution assumptions
- Works with skewed data

**Limitations**:
- Less sensitive than Z-score
- May miss subtle anomalies

### 3. Moving Average Method

**Purpose**: Detect deviations from recent trends.

**Algorithm**:
```
MA = (x₁ + x₂ + ... + xₙ) / n
deviation = |x - MA| / σ_MA

Anomaly if: deviation > threshold
```

**Window Size**: Dynamically calculated as min(20, floor(history_length / 2))

**Advantages**:
- Adapts to recent trends
- Good for time-series data
- Handles seasonal patterns

**Limitations**:
- Lags behind rapid changes
- Requires sufficient history

## Pattern Recognition

### 1. Sequential Pattern Detection

**Purpose**: Identify time-ordered event sequences.

**Algorithm**:
```
1. Group observations by correlation_id
2. Sort each group by timestamp
3. Extract event types and properties
4. Calculate time constraints between events
5. Match against known patterns or create new
```

**Pattern Signature**:
```json
{
  "events": [
    { "type": "login_attempt", "properties": {"result": "failed"} },
    { "type": "login_attempt", "properties": {"result": "failed"} },
    { "type": "account_lock" }
  ],
  "timeConstraints": {
    "maxTimeBetween": "30 seconds"
  }
}
```

**Confidence Score**:
```
confidence = min(95, 50 + occurrence_count * 5)
```

### 2. Frequency Pattern Detection

**Purpose**: Identify high-frequency events.

**Algorithm**:
```
1. Count occurrences of each event type
2. Calculate frequency ratio: count / total_observations
3. Flag patterns where count >= min_occurrences threshold
```

**Confidence Score**:
```
confidence = min(100, (count / total) * 100)
```

### 3. Correlation Pattern Detection

**Purpose**: Find events that co-occur within time windows.

**Algorithm**:
```
1. Define time window (default: 5 minutes)
2. For each observation:
   a. Find all observations within time window
   b. If >= 2 different event types found, create correlation pattern
3. Group similar correlations
```

**Time Window**: Configurable, default 300,000ms (5 minutes)

## Temporal Analysis

### 1. Trend Detection (Linear Regression)

**Purpose**: Identify increasing, decreasing, or stable trends.

**Algorithm**:
```
Linear Regression: y = mx + b

Where:
- x = time (normalized)
- y = metric value
- m = slope (trend direction)
- b = intercept
```

**R-Squared Calculation**:
```
R² = 1 - (SS_res / SS_tot)

Where:
- SS_res = Σ(yᵢ - ŷᵢ)² (residual sum of squares)
- SS_tot = Σ(yᵢ - ȳ)² (total sum of squares)
```

**Trend Classification**:
```
if |slope| < 0.01: trend = "stable"
else if slope > 0: trend = "increasing"
else: trend = "decreasing"
```

### 2. Forecasting (Linear Extrapolation)

**Purpose**: Predict future values.

**Algorithm**:
```
For each future period i:
  x_future = x_last + (time_step * i)
  y_predicted = m * x_future + b
  
  margin = 1.96 * standard_error  // 95% confidence
  confidence_interval = [y_predicted - margin, y_predicted + margin]
```

**Standard Error**:
```
SE = sqrt(Σ(yᵢ - ŷᵢ)² / (n - 2))
```

### 3. Seasonality Detection (Autocorrelation)

**Purpose**: Identify repeating patterns.

**Algorithm**:
```
Autocorrelation at lag k:

ρ(k) = Σ((xᵢ - μ)(xᵢ₊ₖ - μ)) / ((n-k) * σ²)

Where:
- k = lag period (e.g., 24 for daily seasonality)
- μ = mean
- σ² = variance
```

**Threshold**: |ρ(k)| > 0.5 indicates significant seasonality

### 4. Change Point Detection (T-Test)

**Purpose**: Identify significant shifts in metrics.

**Algorithm**:
```
1. Use sliding window approach
2. For each potential change point:
   a. Calculate mean before and after
   b. Perform t-test for significance
3. Flag points with t-statistic > threshold
```

**T-Statistic**:
```
t = |μ_before - μ_after| / (pooled_std * sqrt(2/window_size))

Threshold: t > 2.0 (approximately 95% confidence)
```

## Relationship Mapping

### 1. Entity Extraction

**Purpose**: Identify entities in observations.

**Algorithm**:
```
1. Scan observation payload for entity indicators:
   - user_id, username → User entity
   - service, service_name → Service entity
   - host, hostname, server → Host entity
2. Extract entity attributes
3. Assign confidence score based on field completeness
```

**Confidence Scoring**:
```
User: 90 (if user_id present)
Service: 95 (if service name present)
Host: 85 (if hostname present)
```

### 2. Relationship Discovery

**Purpose**: Find connections between entities.

**Algorithm**:
```
1. Find co-occurring entities in observations
2. Determine relationship type based on entity types:
   - Service → Service: communicates_with
   - Service → Host: deployed_on
   - User → *: accesses
3. Calculate relationship strength
```

**Strength Calculation**:
```
strength = min(100, (co_occurrences / total_observations) * 100)
```

### 3. Dependency Graph Construction

**Purpose**: Build network of entity dependencies.

**Algorithm**:
```
1. Start with root entity
2. Recursively traverse relationships:
   a. Fetch entity details
   b. Fetch outgoing relationships
   c. Add to graph (nodes + edges)
   d. Recurse on target entities (up to max depth)
3. Return graph structure
```

**Max Depth**: Configurable, default 3 levels

## Sentiment Analysis

### 1. Text Sentiment Scoring

**Purpose**: Analyze emotional tone of text.

**Algorithm**:
```
1. Tokenize text
2. Match tokens against sentiment lexicon
3. Calculate scores:
   - score = Σ(positive_scores) - Σ(negative_scores)
   - comparative = score / token_count
4. Classify sentiment based on comparative score
```

**Classification**:
```
if comparative > 0.1: "positive"
else if comparative < -0.1: "negative"
else: "neutral"
```

### 2. Urgency Detection

**Purpose**: Identify urgent messages.

**Algorithm**:
```
1. Define urgent keywords
2. Count occurrences in text
3. Classify urgency:
   - >= 3 matches: "high"
   - >= 1 match: "medium"
   - else: "low"
```

**Urgent Keywords**: urgent, critical, emergency, asap, immediately, now, quickly, priority, important, severe

### 3. Sentiment Shift Detection

**Purpose**: Identify changes in sentiment over time.

**Algorithm**:
```
1. Split sentiment time series in half
2. Calculate average sentiment for each half
3. Compute difference and magnitude
4. Classify shift:
   - magnitude >= 0.1:
     - diff > 0: "improving"
     - diff < 0: "deteriorating"
   - else: "stable"
```

## Threshold Management

### 1. Auto-Adjustment Algorithm

**Purpose**: Dynamically optimize thresholds.

**Algorithm**:
```
1. Collect historical metric values
2. Calculate statistical properties:
   - mean, std dev, percentiles
3. Determine optimal threshold based on operator:
   - For '>': max(p95, μ + 2σ)
   - For '<': min(p05, μ - 2σ)
4. Update threshold in database
```

**Minimum History**: 100 samples required

### 2. Threshold Evaluation

**Purpose**: Compare values against thresholds.

**Operators**:
```
'>' : value > threshold
'<' : value < threshold
'>=' : value >= threshold
'<=' : value <= threshold
'==' : value == threshold
'!=' : value != threshold
```

## Performance Considerations

### Time Complexity

- **Z-Score Detection**: O(n) for history, O(1) for evaluation
- **IQR Detection**: O(n log n) for sorting
- **Pattern Matching**: O(n * m) where n = observations, m = patterns
- **Trend Analysis**: O(n) for linear regression
- **Relationship Discovery**: O(n²) for pairwise comparisons

### Space Complexity

- **Historical Data Cache**: O(k) where k = max_history_size (default: 1000)
- **Pattern Storage**: O(p) where p = number of active patterns
- **Entity Graph**: O(v + e) where v = vertices, e = edges

### Optimization Techniques

1. **Caching**: In-memory cache for recent observations
2. **Batching**: Batch database operations
3. **Indexing**: Database indexes on timestamp fields
4. **Sampling**: Sample large datasets for trend analysis
5. **Lazy Loading**: Load historical data only when needed

## References

1. **Statistical Methods**:
   - Grubbs' Test for Outliers
   - Tukey's Method (IQR)
   - Moving Average Models

2. **Pattern Recognition**:
   - Sequential Pattern Mining (SPADE algorithm)
   - Apriori Algorithm (frequent itemsets)

3. **Time Series Analysis**:
   - ARIMA Models
   - Seasonal Decomposition
   - Change Point Detection (PELT algorithm)

4. **Sentiment Analysis**:
   - AFINN Lexicon
   - VADER Sentiment Analysis
